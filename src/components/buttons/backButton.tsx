import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from "react-native";

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center"
  >
    <View className="mb-2">
      <Ionicons name="chevron-back" size={28} color="black" />
    </View>
  </TouchableOpacity>
);

export default BackButton;