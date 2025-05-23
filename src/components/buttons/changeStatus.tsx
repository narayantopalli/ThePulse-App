import { TouchableOpacity, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';

const ChangeStatus = () => {
  return (
    <TouchableOpacity 
        className="bg-general-900 px-2 py-2 rounded-lg flex-row items-center ml-2"
        onPress={() => router.replace({pathname: "/(root)/camera", params: { path: "/(root)/update-status", returnPath: "/(root)/(tabs)/profile", savePhoto: "false" }})}
    >
        <MaterialIcons name="camera-alt" size={20} color="black" />
        <Text className="text-black font-JakartaMedium ml-1">Update Status</Text>
    </TouchableOpacity>
  );
};

export default ChangeStatus;
