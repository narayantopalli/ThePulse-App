import { View } from "react-native";
import { Switch } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useSession } from "@/contexts/SessionContext";

interface AnonymousToggleProps {
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
}

const AnonymousToggle = ({ isAnonymous, setIsAnonymous }: AnonymousToggleProps) => {
  const { forceAnonymous } = useSession();
  
  // If forceAnonymous is true, we should always be anonymous
  const effectiveIsAnonymous = forceAnonymous ? true : isAnonymous;

  return (
    <View className="flex-row items-center">
      <MaterialIcons 
        name={effectiveIsAnonymous ? "visibility-off" : "visibility"} 
        size={22} 
        color={effectiveIsAnonymous ? "#0095F6" : "#262626"} 
        style={{ marginRight: 2 }}
      />
      <Switch
        value={effectiveIsAnonymous}
        onValueChange={forceAnonymous ? undefined : setIsAnonymous}
        trackColor={{ false: '#DBDBDB', true: '#0095F6' }}
        thumbColor={effectiveIsAnonymous ? '#FFFFFF' : '#FFFFFF'}
        style={{ transform: [{ scale: 0.8 }] }}
      />
    </View>
  );
};

export default AnonymousToggle;
