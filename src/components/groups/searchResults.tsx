import { View, Text, FlatList, ActivityIndicator, RefreshControl, Modal, Pressable, TouchableOpacity } from "react-native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import GroupItem from "./GroupItem";
import CreateGroupModal from "./CreateGroupModal";
import GroupListHeader from "./GroupListHeader";
import { Group, SearchResultsProps } from '@/types/type';
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GroupDetailsModal from "./GroupDetailsModal";

const SearchResults = ({ groups, onEndReached, onRefresh, refreshing, setRefreshing, groupRequests, setGroupRequests }: SearchResultsProps) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<string | null>(null);
  const { userMetadata, myGroups, setMyGroups } = useSession();
  const [requestsMap, setRequestsMap] = useState<Record<string, number>>({});

  const updateGroupRequests = (groupId: string, value: number | ((prev: number) => number)) => {
    setRequestsMap(prev => {
      const currentCount = prev[groupId] || 0;
      const newCount = typeof value === 'function' ? value(currentCount) : value;
      return { ...prev, [groupId]: newCount };
    });
  };

  const handleJoin = async (groupId: string) => {
    try {
      const groupToJoin = groups.find(g => g.id === groupId);
      if (!groupToJoin) return;

      if (!groupToJoin.private) {
        // For non-private groups, join directly
        const { error: joinError } = await supabase
          .from('users_to_groups')
          .insert({ user_id: userMetadata?.id, group_id: groupId });

        if (joinError) throw joinError;
        setMyGroups([...myGroups, groupToJoin]);
      } else {
        // For private groups, create a join request
        const { error: requestError } = await supabase
          .from('users_to_groups')
          .insert({ user_id: userMetadata?.id, group_id: groupId, member: false });

        if (requestError) throw requestError;
        setGroupRequests([...groupRequests, groupToJoin]);
      }
    } catch (error) {
      console.error('Error joining/requesting group:', error);
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      const { error: leaveError } = await supabase
        .from('users_to_groups')
        .delete()
        .eq('user_id', userMetadata?.id)
        .eq('group_id', groupId);

      if (leaveError) throw leaveError;

      // Remove from both myGroups and groupRequests
      setMyGroups(myGroups.filter(group => group.id !== groupId));
      const channel = await AsyncStorage.getItem('channel');
      if (channel === groupId) {
        await AsyncStorage.removeItem('channel');
        const forceAnonymous = await AsyncStorage.getItem('forceAnonymous');
        if (forceAnonymous) {
          await AsyncStorage.removeItem('forceAnonymous');
        }
      }
      setGroupRequests(groupRequests.filter(group => group.id !== groupId));
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleLeavePress = (groupID: string, isRequestingJoin: boolean) => {
    if (isRequestingJoin) {
      handleLeave(groupID);
    } else {
      setGroupToLeave(groupID);
      setShowLeaveConfirmation(true);
    }
  };

  const handleShowMembers = (group: Group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setMyGroups([...myGroups, newGroup]);
  };

  const renderFooter = () => {
    if (!refreshing) return null;
    return (
      <View className="py-6">
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-general-300">
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<GroupListHeader onCreatePress={() => setIsCreateModalVisible(true)} />}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000000"]}
            tintColor="#000000"
          />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-gray-500 text-lg">No available groups</Text>
            <Text className="text-gray-400 text-sm mt-2">Swipe down to refresh</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {}}>
            <GroupItem
              item={item}
              isMember={myGroups.some(group => group.id === item.id)}
              isRequestingJoin={groupRequests.some(group => group.id === item.id)}
              onJoin={() => handleJoin(item.id)}
              onLeave={(groupId, isRequestingJoin) => handleLeavePress(groupId, isRequestingJoin)}
              onShowMembers={handleShowMembers}
              numRequests={item.private ? (requestsMap[item.id] || 0) : 0}
              setNumRequests={(value) => updateGroupRequests(item.id, value)}
            />
          </TouchableOpacity>
        )}
      />
      
      <GroupDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        group={selectedGroup}
        numRequests={selectedGroup?.private ? (requestsMap[selectedGroup.id] || 0) : 0}
        setNumRequests={(value: number) => updateGroupRequests(selectedGroup?.id || '', value)}
      />

      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onGroupCreated={handleGroupCreated}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLeaveConfirmation}
        onRequestClose={() => setShowLeaveConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 m-4 w-[80%]">
            <Text className="text-lg font-semibold mb-4">Leave Group</Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to leave this group? You may have to request to join again.
            </Text>
            <View className="flex-row justify-end space-x-4">
              <Pressable
                onPress={() => setShowLeaveConfirmation(false)}
                className="px-4 py-2"
              >
                <Text className="text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (groupToLeave) {
                    handleLeave(groupToLeave);
                    setShowLeaveConfirmation(false);
                    setGroupToLeave(null);
                  }
                }}
                className="px-4 py-2 bg-red-500 rounded-lg"
              >
                <Text className="text-white">Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SearchResults; 
