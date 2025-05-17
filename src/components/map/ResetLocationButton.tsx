import { TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface ResetLocationButtonProps {
  onPress: () => void;
}

const ResetLocationButton = ({ onPress }: ResetLocationButtonProps) => {
  return (
    <TouchableOpacity 
      className="absolute bottom-[100px] right-5 w-[50px] h-[50px] bg-[#007AFF] rounded-full justify-center items-center shadow-lg"
      onPress={onPress}
    >
      <Ionicons name="home" size={24} color="white" />
    </TouchableOpacity>
  );
};

export default ResetLocationButton;
