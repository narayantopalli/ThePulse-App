import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import { ProfileBioProps } from "@/types/type";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileBio = ({ bio, isOwnProfile = false }: ProfileBioProps) => {
  const { userMetadata } = useSession();
  const bioText = bio || userMetadata?.bio;

  return (
    <View className="px-4 mt-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="bg-white/80 p-1.5 rounded-full mr-2">
            <MaterialCommunityIcons name="account" size={18} color="#000" />
          </View>
          <Text className="text-black text-lg font-JakartaBold">About</Text>
        </View>
        {isOwnProfile && (
          <TouchableOpacity 
            onPress={() => router.replace("/(root)/(edit)/bio-edit")}
            className="flex-row items-center bg-white/80 px-2 py-1 rounded-full"
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#666" />
            <Text className="text-gray-600 text-sm ml-1 font-JakartaMedium">Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100">
        {bioText ? (
          <Text className="text-gray-800 text-base leading-5 font-JakartaMedium">
            {bioText}
          </Text>
        ) : (
          <Text className="text-gray-400 text-base font-JakartaMedium">
            No bio yet
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileBio;
