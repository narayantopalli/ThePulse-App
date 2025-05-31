import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import SearchResults from "@/components/groups/searchResults";
import { useSession } from "@/contexts/SessionContext";
import { loadGroupRequestsFromDatabase, loadMyGroupsFromDatabase } from "@/utils/loadGroups";
import { Group } from "@/types/type";
import { useSearch } from "@/contexts/SearchContext";
import { getLocalImageURI } from "@/utils/getImage";
import { supabase } from "@/utils/supabase";

type TabType = 'tribes' | 'people';

const Groups = () => {
  const { userMetadata, setMyGroups, groupRequests, setGroupRequests } = useSession();
  const { query, setQuery } = useSearch();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tribes');
  const DEFAULT_ITEMS_PER_PAGE = 10;

  const searchPeople = async (searchQuery: string, pageNum: number = 0) => {
    try {
      const { data, error } = await supabase.rpc("search_people", {
        p_search: searchQuery.trim(),
        p_page:   pageNum,
        p_limit:  DEFAULT_ITEMS_PER_PAGE,
      });

      if (error) throw error;

      const resolvedUsers = await Promise.all(
        (data ?? []).map(async (u: any) => ({
          id:         u.id,
          firstname:  u.firstname,
          lastname:   u.lastname,
          avatar_url: await getLocalImageURI(u.avatar_url),
          created_at: u.created_at
        })),
      );

      setUsers(prev =>
        pageNum === 0
          ? resolvedUsers
          : [
              ...prev,
              ...resolvedUsers.filter(r => !prev.some(p => p.id === r.id)),
            ],
      );

      setHasMore(resolvedUsers.length === DEFAULT_ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error searching people:', error);
    }
  };

  const searchGroups = async (searchQuery: string, pageNum: number = 0) => {
    try {
      const { data, error } = await supabase.rpc("search_groups", {
        p_search: searchQuery.trim(),
        p_user:   userMetadata?.id,
        p_page:   pageNum,
        p_limit:  DEFAULT_ITEMS_PER_PAGE,
      });
      if (error) throw error;
  
      setGroups(prev =>
        pageNum === 0
          ? data
          : [
              ...prev,
              ...data.filter((r: any) => !prev.some(p => p.id === r.id)),
            ],
      );
  
      setHasMore(data.length === DEFAULT_ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error searching groups:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      if (activeTab === 'tribes') {
        searchGroups(query, 0);
      } else {
        searchPeople(query, 0);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userMetadata?.id) {
      await Promise.all([
        activeTab === 'tribes' ? searchGroups(query, 0) : searchPeople(query, 0),
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
      if (activeTab === 'tribes') {
        searchGroups(query, nextPage);
      } else {
        searchPeople(query, nextPage);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (userMetadata?.id) {
      searchGroups("", 0);
    }
    setQuery("");
  }, [userMetadata?.id]);

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      onPress={() => {
        setActiveTab(tab);
        setPage(0);
        if (tab === 'tribes') {
          searchGroups(query, 0);
        } else {
          searchPeople(query, 0);
        }
      }}
      className={`flex-1 py-3 ${activeTab === tab ? 'border-b-2 border-indigo-500' : ''}`}
    >
      <Text className={`text-center font-medium ${activeTab === tab ? 'text-indigo-500' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View className="flex-1 bg-general-300">
      <View className="flex-row border-b border-gray-200 bg-white">
        {renderTabButton('tribes', 'Tribes')}
        {renderTabButton('people', 'People')}
      </View>
      <View className="flex-1">
        <SearchResults 
          groups={activeTab === 'tribes' ? groups : []} 
          users={activeTab === 'people' ? users : []}
          onEndReached={loadMore}
          onRefresh={onRefresh}
          refreshing={refreshing}
          groupRequests={groupRequests}
          setGroupRequests={setGroupRequests}
          showCreateButton={activeTab === 'tribes'}
        />
      </View>
    </View>
  );
};

export default Groups;
