import { Keyboard, TouchableWithoutFeedback, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/buttons/backButton";
import { SafeAreaView } from "react-native-safe-area-context";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { useState, useEffect } from "react";
import SearchForm from "@/components/groups/searchForm";
import { supabase } from "@/utils/supabase";
import SearchResults from "@/components/groups/searchResults";
import { useSession } from "@/contexts/SessionContext";
import { loadGroupRequestsFromDatabase, loadGroupRequestsFromLocalStorage, loadMyGroupsFromDatabase, loadMyGroupsFromLocalStorage } from "@/utils/loadGroups";
import { Group } from "@/types/type";
import { useSearch } from "@/contexts/SearchContext";

const Groups = () => {
  const { userMetadata, myGroups, setMyGroups, groupRequests, setGroupRequests } = useSession();
  const { query, setQuery } = useSearch();
  const [groups, setGroups] = useState<Group[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const DEFAULT_ITEMS_PER_PAGE = 10;

  const searchGroups = async (searchQuery: string, pageNum: number = 0) => {
    let ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;

    // Reduces the number of database queries by checking if the group is a match before querying the database
    for (let group of groups) {
      if (group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        ITEMS_PER_PAGE--;
      } else {
        groups.splice(groups.indexOf(group), 1);
      }
    }
    try {
      // Get groups the user is a member of
      let typedUserGroups: Group[] = [];
      if (myGroups[0] == null) {
        typedUserGroups = [];
      } else {
        typedUserGroups = (myGroups || []) as unknown as Group[];
      }

      // Get groups the user is requesting to join
      if (groupRequests[0] != null) {
        typedUserGroups = [...typedUserGroups, ...(groupRequests || []) as unknown as Group[]];
      }
      typedUserGroups = typedUserGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const userGroupIds = typedUserGroups.map(g => g.id).join(',') || '';
    
      // Then get other groups
      const { data: otherGroups, error: otherGroupsError } = await supabase
        .from('groups')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .not('id', 'in', `(${userGroupIds})`)
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)
        .order('size', { ascending: false });

      if (otherGroupsError) throw otherGroupsError;

      const allGroups = [...typedUserGroups, ...(otherGroups as Group[])];
      
      setGroups(prev => {
        if (pageNum === 0) return allGroups;
        return [...prev, ...allGroups.filter(group => !prev.some(prevGroup => prevGroup.id === group.id))];
      });
      
      setHasMore(!!otherGroups && otherGroups.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error searching groups:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      searchGroups(query, 0);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userMetadata?.id) {
      await Promise.all([
        searchGroups(query, 0),
        loadMyGroupsFromDatabase(userMetadata.id, setMyGroups),
        loadGroupRequestsFromDatabase(userMetadata.id, setGroupRequests)
      ]);
    }
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchGroups(query, nextPage);
    }
  };

  // Initial load
  useEffect(() => {
    if (userMetadata?.id) {
      searchGroups("", 0);
    }
    setQuery("");
  }, [userMetadata?.id]);
  
  return (
    <View className="flex-1 bg-general-300">
      <View className="flex-1">
        <SearchResults 
          groups={groups} 
          onEndReached={loadMore}
          onRefresh={onRefresh}
          refreshing={refreshing}
          setRefreshing={setRefreshing}
          groupRequests={groupRequests}
          setGroupRequests={setGroupRequests}
        />
      </View>
    </View>
  );
};

export default Groups;
