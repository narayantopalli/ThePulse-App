import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Pressable } from "react-native";

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    className="flex-row items-center justify-center"
    android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', radius: 20 }}
  >
    {({ pressed }) => (
      <View className={`bg-general-500 rounded-full p-1.5 ${pressed ? 'opacity-70' : ''}`}>
        <Ionicons name="chevron-back" size={28} color="black" />
      </View>
    )}
  </Pressable>
);

export default BackButton;
