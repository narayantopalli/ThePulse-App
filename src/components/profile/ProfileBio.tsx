import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ProfileBioProps } from "@/types/type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from "react";

const ProfileBio = ({ bio, isOwnProfile = false }: ProfileBioProps) => {
  const bioText = bio || "";
  const [showFull, setShowFull] = useState(false);

  return (
    <View className="ml-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="bg-white/80 p-1.5 rounded-full mr-2">
            <MaterialCommunityIcons name="account" size={18} color="#000" />
          </View>
          <Text className="text-black text-lg font-JakartaBold">About</Text>
        </View>
        <View className="flex-row">
          {bioText && (
            <TouchableOpacity 
              onPress={() => setShowFull(!showFull)}
              className="flex-row items-center bg-white/80 p-1 rounded-full"
            >
              <MaterialCommunityIcons name={showFull ? "chevron-up" : "chevron-down"} size={16} color="#666" />
              <Text className="text-gray-600 text-xs mr-1 font-JakartaMedium">
                {showFull ? "Show less" : "Show full"}
              </Text>
            </TouchableOpacity>
          )}
          {isOwnProfile && (
            <TouchableOpacity 
              onPress={() => router.replace("/(root)/(edit)/bio-edit")}
              className="flex-row items-center bg-white/80 px-2 py-1 ml-1 rounded-full"
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#666" />
              <Text className="text-gray-600 text-sm ml-1 font-JakartaMedium">Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100">
        {bioText ? (
          <Text className="text-gray-800 font-JakartaMedium" numberOfLines={showFull ? undefined : 3}>
            {bioText}
          </Text>
        ) : (
          <Text className="text-gray-400 text-base font-JakartaMedium">
            No bio yet.
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileBio;
