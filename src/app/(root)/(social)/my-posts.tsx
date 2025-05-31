import { View, Text } from "react-native";
import MyPostsFeed from "@/components/myPosts/MyPostsFeed";
import { router } from "expo-router";
import BackButton from "@/components/buttons/backButton";
import SmallProfilePhoto from "@/components/smallProfilePhoto";

const MyPosts = () => {
  
  return (
    <View className="flex-1 bg-general-300">
      <View className="flex flex-row justify-between items-center bg-white px-4 h-14 shadow-sm">
        <BackButton onPress={() => router.back()} />
        <Text className="text-xl font-JakartaBold flex-1 text-center">My Posts</Text>
        <View className="rounded-full overflow-hidden">
          <SmallProfilePhoto />
        </View>
      </View>
      <MyPostsFeed/>
    </View>
  );
};

export default MyPosts;
