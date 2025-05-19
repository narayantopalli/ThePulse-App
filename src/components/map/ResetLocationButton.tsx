import { TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ResetLocationButtonProps } from "@/types/type";

const ResetLocationButton = ({ onPress }: ResetLocationButtonProps) => {
  return (
    <TouchableOpacity 
      className="absolute bottom-24 right-5 w-14 h-14 bg-[#007AFF] rounded-full justify-center items-center shadow-lg"
      onPress={onPress}
    >
      <Ionicons name="home" size={24} color="white" />
    </TouchableOpacity>
  );
};

export default ResetLocationButton;
