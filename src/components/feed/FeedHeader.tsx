import { View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import GroupSelector from "@/components/feed/GroupSelector";
import AnonymousToggle from "@/components/AnonymousToggle";
import VisibilityRadiusButton from "@/components/VisibilityRadiusButton";
import VibeButton from "@/components/feed/VibeButton";
import AddPostButton from "@/components/feed/AddPostButton";

const FeedHeader = () => {
  const { isAnonymous, setIsAnonymous, searchRadius, setSearchRadius } = useSession();

  return (
    <View className="bg-white/95 py-2 rounded-b-3xl shadow-sm">
      <View className="flex-row items-center justify-between px-2">
        <View className="flex-row flex-1 items-center justify-between">
          <View className="bg-indigo-50 rounded-full p-2.5 shadow-sm">
            <GroupSelector />
          </View>
          <View className="flex-row items-center bg-violet-100 rounded-full p-1 px-2 shadow-sm">
            <AnonymousToggle 
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
            />
          </View>
          <View className="flex-row items-center">
            <VisibilityRadiusButton
              searchRadius={searchRadius}
              setSearchRadius={setSearchRadius}
            />
          </View>
          <View className="shadow-sm">
            <VibeButton />
          </View>
          <View className="shadow-sm">
            <AddPostButton />
          </View>
        </View>
      </View>
    </View>
  );
};

export default FeedHeader; 