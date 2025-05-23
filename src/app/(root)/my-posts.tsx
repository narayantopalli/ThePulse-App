import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/buttons/backButton";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPostsFeed from "@/components/myPosts/MyPostsFeed";
import SmallProfilePhoto from "@/components/smallProfilePhoto";

const MyPosts = () => {
  const { goBackPath } = useLocalSearchParams();
  
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 bg-general-300">
        <View className="flex flex-row justify-between items-center bg-white px-4 h-12">
          <View className="flex-row items-center mr-4">
            <BackButton onPress={() => goBackPath ? router.replace(goBackPath as string) : router.replace("/(root)/(tabs)/profile")} />
          </View>
          <View className="mb-2 border-2 border-black rounded-full">
            <SmallProfilePhoto />
          </View>
        </View>
        <MyPostsFeed/>
      </View>
    </SafeAreaView>
  );
};

export default MyPosts;
