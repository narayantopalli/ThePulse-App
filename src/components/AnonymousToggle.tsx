import { View } from "react-native";
import { Switch } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
}

const AnonymousToggle = ({ isAnonymous, setIsAnonymous }: AnonymousToggleProps) => {
  return (
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
  );
};

export default AnonymousToggle; 