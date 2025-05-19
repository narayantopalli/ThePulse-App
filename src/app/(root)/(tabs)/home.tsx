import { View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import Feed from "@/components/feed/Feed";
import AddPostButton from "@/components/feed/AddPostButton";
import { Switch } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import PulseAI from "@/components/pulseAI/pulseAI";
import VisibilityRadiusButton from "@/components/VisibilityRadiusButton";

const Home = () => {
  const { loading, isAnonymous, setIsAnonymous, searchRadius, setSearchRadius } = useSession();

  if (loading) return null;

  return (
    <View className="flex-1 bg-general-300">
      <Feed/>
      <View className="absolute top-2 right-4 bg-general-800 rounded-full px-3 py-2 flex-row items-center">
        <MaterialIcons 
          name={isAnonymous ? "visibility" : "visibility-off"} 
          size={24} 
          color={isAnonymous ? "#2563eb" : "#f4f3f4"} 
          style={{ marginRight: 8 }}
        />
        <Switch
          value={isAnonymous}
          onValueChange={setIsAnonymous}
          trackColor={{ false: '#767577', true: '#2563eb' }}
          thumbColor={isAnonymous ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      <VisibilityRadiusButton
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
      />
      <PulseAI />
      <AddPostButton />
    </View>
  );
};

export default Home;
