import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

const GroupSelector = () => {
  const { myGroups, channel, setChannel, setForceAnonymous } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectChannel = async (newChannel: string) => {
    setChannel(newChannel);
    await AsyncStorage.setItem('channel', newChannel);
    
    // Set forceAnonymous based on the selected group's anonymous property
    if (newChannel === '00000000-0000-0000-0000-000000000000') {
      setForceAnonymous(false);
      await AsyncStorage.setItem('forceAnonymous', 'false');
    } else {
      const selectedGroup = myGroups.find(group => group.id === newChannel);
      setForceAnonymous(selectedGroup?.anonymous || false);
      await AsyncStorage.setItem('forceAnonymous', String(selectedGroup?.anonymous || false));
    }
    
    setIsModalVisible(false);
  };

  const getCurrentFeedName = () => {
    if (channel === '00000000-0000-0000-0000-000000000000') return 'Main Feed';
    const currentGroup = myGroups.find(group => group.id === channel);
    return currentGroup?.name || 'Main Feed';
  };

  const renderFeedItem = ({ item }: { item: { id: string; name: string; size?: number } }) => {
    const isSelected = channel === item.id;
    const isMainFeed = item.id === '00000000-0000-0000-0000-000000000000';

    return (
      <TouchableOpacity
        onPress={() => handleSelectChannel(item.id)}
        className={`p-4 rounded-xl mb-2 flex-row items-center justify-between ${
          isSelected ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
        }`}
      >
        <View className="flex-row items-center space-x-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
            isSelected ? 'bg-indigo-100' : 'bg-gray-100'
          }`}>
            <Ionicons 
              name={isMainFeed ? "home" : "people"} 
              size={20} 
              color={isSelected ? "#4F46E5" : "#6B7280"} 
            />
          </View>
          <View>
            <Text className={`font-JakartaMedium text-base ${
              isSelected ? 'text-indigo-600' : 'text-gray-800'
            }`}>
              {item.name}
            </Text>
            <Text className="text-gray-500 text-sm font-JakartaRegular">
              {isMainFeed ? 'Global community feed' : `${item.size || 0} members`}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View className="w-6 h-6 rounded-full bg-indigo-100 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="#4F46E5" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center"
      >
        <Ionicons name="people" size={20} color="#4B5563" />
        <View className="ml-2 w-16">
          <Text
            className="text-gray-800 font-JakartaMedium"
            style={{
              fontSize: 10,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getCurrentFeedName()}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px]"
          >
            <View className="mb-6">
              <Text className="text-xl font-JakartaSemiBold">Select Feed</Text>
            </View>
            
            <FlatList
              data={[{ id: '00000000-0000-0000-0000-000000000000', name: 'Main Feed' }, ...myGroups]}
              keyExtractor={(item) => item.id}
              renderItem={renderFeedItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default GroupSelector;
