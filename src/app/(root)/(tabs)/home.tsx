import { View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import Feed from "@/components/feed/Feed";
import AddPostButton from "@/components/feed/AddPostButton";
import PulseAI from "@/components/pulseAI/pulseAI";
import VisibilityRadiusButton from "@/components/VisibilityRadiusButton";
import AnonymousToggle from "@/components/AnonymousToggle";
import { useRevenueCat } from "@/providers/RevenueCat";

const Home = () => {
  const { isPro } = useRevenueCat();
  const { loading, isAnonymous, setIsAnonymous, searchRadius, setSearchRadius } = useSession();

  if (loading) return null;

  return (
    <View className="flex-1 bg-general-300">
      <Feed/>
      <AnonymousToggle 
        isAnonymous={isAnonymous}
        setIsAnonymous={setIsAnonymous}
      />
      <VisibilityRadiusButton
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
      />
      <PulseAI />
      <View className="absolute bottom-28 self-end mr-4">
        <AddPostButton />
      </View>
    </View>
  );
};

export default Home;
