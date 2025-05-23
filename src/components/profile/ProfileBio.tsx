import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import { ProfileBioProps } from "@/types/type";

const ProfileBio = ({ bio, isOwnProfile = false }: ProfileBioProps) => {
  const { userMetadata } = useSession();
  const bioText = bio || userMetadata?.bio;

  return (
    <View className="mt-4 mx-4">
      <Text className="text-black text-2xl font-JakartaMedium">Bio</Text>
      <TouchableOpacity 
        className="mt-2 rounded-2xl bg-red-500"
        onPress={() => router.replace("/(root)/(edit)/bio-edit")}
        disabled={!isOwnProfile}
      >
        <View className="bg-white border-2 border-black rounded-2xl p-4">
          {bioText ? (
            <Text className="text-black text-xl font-JakartaMedium">
              {bioText}
            </Text>
          ) : (
            <Text className="text-black text-xl font-JakartaMedium">
              No bio set currently.
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileBio;
