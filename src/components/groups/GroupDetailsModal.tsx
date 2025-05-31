import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, FlatList, Image } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { getLocalImageURI } from "@/utils/getImage";
import { router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import { GroupMember, GroupDetailsModalProps } from "@/types/type";
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabType = 'members' | 'requests';

const GroupDetailsModal = ({ visible, onClose, group, numRequests = 0, setNumRequests }: GroupDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [requests, setRequests] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const { userMetadata } = useSession();

  useEffect(() => {
    if (visible && group) {
      setPage(0);
      setGroupMembers([]);
      setRequests([]);
      setHasMore(true);
      if (activeTab === 'members') {
        fetchGroupMembers(group.id, 0, true);
      } else {
        fetchRequests(group.id, 0, true);
      }
    }
  }, [visible, group, activeTab]);

  const anonymousMemberName = group?.name 
    ? `${group.name.replace(/['\s-].*$/, '')}ite` 
    : 'Anonymous Member';

  const fetchGroupMembers = async (groupId: string, pageNumber: number, isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial) || !group) return;
    
    setLoading(true);
    if (isInitial) setInitialLoading(true);
    
    try {
      if (group.anonymous) {
        const { count, error } = await supabase
          .from('users_to_groups')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId);

        if (error) throw error;

        const totalItems = count || 0;
        const startIndex = pageNumber * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        
        const placeholderMembers = Array.from({ length: endIndex - startIndex }, (_, i) => ({
          id: `anonymous-${startIndex + i}`,
          firstname: 'Anonymous',
          lastname: anonymousMemberName,
          avatar_url: ''
        }));

        setGroupMembers(prev => isInitial ? placeholderMembers : [...prev, ...placeholderMembers]);
        setHasMore(endIndex < totalItems);
        setPage(pageNumber + 1);
      } else {
        const { data, error, count } = await supabase
          .from('users_to_groups')
          .select(`
            user:profiles!users_to_group_user_id_fkey (
              id,
              firstname,
              lastname,
              avatar_url
            )
          `, { count: 'exact' })
          .eq('group_id', groupId)
          .eq('member', true)
          .order('created_at', { ascending: false })
          .range(pageNumber * ITEMS_PER_PAGE, (pageNumber + 1) * ITEMS_PER_PAGE - 1);

        if (error) throw error;

        const members = (data as unknown as { user: GroupMember }[]).map(item => ({
          id: item.user.id,
          firstname: item.user.firstname,
          lastname: item.user.lastname,
          avatar_url: item.user.avatar_url
        }));

        const avatarUrls = members.map(member => member.avatar_url);
        const localImages = await Promise.all(
          avatarUrls.map(url => url ? getLocalImageURI(url) : null)
        );

        const membersWithLocalImages = members.map((member, index) => ({
          ...member,
          avatar_url: localImages[index] || member.avatar_url
        }));

        setGroupMembers(prev => isInitial ? membersWithLocalImages : [...prev, ...membersWithLocalImages]);
        
        const totalItems = count || 0;
        const currentItemCount = (pageNumber + 1) * ITEMS_PER_PAGE;
        setHasMore(currentItemCount < totalItems);
        setPage(pageNumber + 1);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoading(false);
    }
  };

  const fetchRequests = async (groupId: string, pageNumber: number, isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial) || !group) return;
    
    setLoading(true);
    if (isInitial) setInitialLoading(true);
    
    try {
      const { data, error, count } = await supabase
        .from('users_to_groups')
        .select(`
          user:profiles!users_to_group_user_id_fkey (
            id,
            firstname,
            lastname,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('group_id', groupId)
        .eq('member', false)
        .order('created_at', { ascending: false })
        .range(pageNumber * ITEMS_PER_PAGE, (pageNumber + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      const requests = (data as unknown as { user: GroupMember }[]).map(item => ({
        id: item.user.id,
        firstname: item.user.firstname,
        lastname: item.user.lastname,
        avatar_url: item.user.avatar_url
      }));

      const avatarUrls = requests.map(request => request.avatar_url);
      const localImages = await Promise.all(
        avatarUrls.map(url => url ? getLocalImageURI(url) : null)
      );

      const requestsWithLocalImages = requests.map((request, index) => ({
        ...request,
        avatar_url: localImages[index] || request.avatar_url
      }));

      setRequests(prev => isInitial ? requestsWithLocalImages : [...prev, ...requestsWithLocalImages]);
      
      const totalItems = count || 0;
      const currentItemCount = (pageNumber + 1) * ITEMS_PER_PAGE;
      setHasMore(currentItemCount < totalItems);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error('Error fetching group requests:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (group && !loading && hasMore) {
      if (activeTab === 'members') {
        fetchGroupMembers(group.id, page);
      } else {
        fetchRequests(group.id, page);
      }
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!group) return;
    setProcessingRequest(userId);
    try {
      const { error } = await supabase
        .from('users_to_groups')
        .update({ member: true })
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      setRequests(prev => prev.filter(request => request.id !== userId));
      setNumRequests(numRequests - 1);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!group) return;
    setProcessingRequest(userId);
    try {
      const { error } = await supabase
        .from('users_to_groups')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      setRequests(prev => prev.filter(request => request.id !== userId));
      setNumRequests(numRequests - 1);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleAvatarChange = async (newAvatarUrl: string) => {
    if (!group) return;
    setIsUpdatingAvatar(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', group.id);

      if (error) throw error;

      // Update the group object with the new avatar URL
      group.avatar_url = newAvatarUrl;
    } catch (error) {
      console.error('Error updating group avatar:', error);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <View className="flex-row items-center p-3 border-b border-gray-100">
      <TouchableOpacity 
        onPress={() => {
          if (!group?.anonymous) {
            if (userMetadata?.id === item.id) {
              router.push('/profile');
            } else {
              router.push({
                pathname: `/(root)/(social)/public-profile`,
                params: {
                  userID: item.id
                }
              });
            }
          }
          onClose();
        }}
        disabled={group?.anonymous}
        className="flex-row items-center flex-1"
      >
        <Image
          source={
            group?.anonymous
              ? require("assets/images/avatar-default-icon.png")
              : item.avatar_url
                ? { uri: item.avatar_url }
                : require("assets/images/avatar-default-icon.png")
          }
          className="w-12 h-12 rounded-full"
        />
        <Text className="font-JakartaMedium text-gray-800 ml-2">
          {group?.anonymous ? "Anonymous " + anonymousMemberName : `${item.firstname} ${item.lastname}`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item }: { item: GroupMember }) => (
    <View className="flex-row items-center p-4 border-b border-gray-100">
      <TouchableOpacity 
        onPress={() => {
          if (!group?.anonymous) {
            if (userMetadata?.id === item.id) {
              router.push('/profile');
            } else {
              router.push({
                pathname: `/(root)/(social)/public-profile`,
                params: {
                  userID: item.id
                }
              });
            }
          }
          onClose();
        }}
        disabled={group?.anonymous}
        className="flex-row items-center flex-1"
      >
        <Image
          source={
            group?.anonymous
              ? require("assets/images/avatar-default-icon.png")
              : item.avatar_url
                ? { uri: item.avatar_url }
                : require("assets/images/avatar-default-icon.png")
          }
          className="w-12 h-12 rounded-full"
        />
        <Text className="font-JakartaMedium text-gray-800 ml-3 text-base">
          {`${item.firstname} ${item.lastname}`}
        </Text>
      </TouchableOpacity>
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleAcceptRequest(item.id)}
          disabled={processingRequest === item.id}
          className="bg-green-500 w-10 h-10 rounded-lg active:bg-green-600 shadow-sm mr-2 flex-row items-center justify-center"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {processingRequest === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="check" size={22} color="white" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRejectRequest(item.id)}
          disabled={processingRequest === item.id}
          className="bg-red-500 w-10 h-10 rounded-lg active:bg-red-600 shadow-sm flex-row items-center justify-center"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {processingRequest === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="close" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (activeTab === 'members') {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500 text-lg font-JakartaMedium">No members yet</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-gray-500 text-lg font-JakartaMedium">No join requests</Text>
        <Text className="text-gray-400 text-sm mt-2 font-JakartaRegular">When someone requests to join, they'll appear here</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-start items-center bg-black/50 pt-72">
        <View className="w-[90%] h-[50%] max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-JakartaSemiBold text-gray-900">
              {group?.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row border-b border-gray-200 mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab('members')}
              className={`flex-1 py-3 ${activeTab === 'members' ? 'border-b-2 border-indigo-500' : ''}`}
            >
              <Text className={`text-center font-medium ${activeTab === 'members' ? 'text-indigo-500' : 'text-gray-500'}`}>
                Members
              </Text>
            </TouchableOpacity>
            {group?.private && (
              <TouchableOpacity
                onPress={() => setActiveTab('requests')}
                className={`flex-1 py-3 ${activeTab === 'requests' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                <View className="flex-row items-center justify-center">
                  <Text className={`text-center font-medium ${activeTab === 'requests' ? 'text-indigo-500' : 'text-gray-500'}`}>
                    Requests
                  </Text>
                  {numRequests > 0 && (
                    <View className="ml-2 bg-red-500 rounded-full px-2 py-0.5">
                      <Text className="text-white text-xs font-JakartaSemiBold">
                        {numRequests > 99 ? '99+' : numRequests}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {initialLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-gray-600 mt-2 font-JakartaMedium">
                Loading {activeTab === 'members' ? 'members' : 'requests'}...
              </Text>
            </View>
          ) : (
            <FlatList
              data={activeTab === 'members' ? groupMembers : requests}
              renderItem={activeTab === 'members' ? renderMemberItem : renderRequestItem}
              keyExtractor={(item) => item.id}
              className="flex-1"
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmptyComponent}
            />
          )}

          <TouchableOpacity 
            onPress={() => {
              onClose();
              setActiveTab('members');
            }}
            className="bg-blue-500 px-4 py-2 rounded-lg mt-4 self-end"
          >
            <Text className="text-white font-JakartaMedium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GroupDetailsModal; 