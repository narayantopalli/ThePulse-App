import React from 'react';
import { View, Text, Image } from 'react-native';

interface UserItemProps {
  item: {
    avatar_url?: string;
    firstname: string;
    lastname: string;
  };
}

const UserItem: React.FC<UserItemProps> = ({ item }) => {
  return (
    <View className="flex-row items-center">
      <Image
        source={item.avatar_url ? { uri: item.avatar_url } : require("assets/images/avatar-default-icon.png")}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
      />
      <View className="ml-3">
        <Text className="text-base font-medium">{item.firstname} {item.lastname}</Text>
        <Text className="text-sm text-gray-500">View Profile</Text>
      </View>
    </View>
  );
};

export default UserItem;