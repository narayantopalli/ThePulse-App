import { TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

interface AIButtonProps {
  onPress?: () => void;
}

const AIButton = ({ onPress }: AIButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="self-begin ml-4 bg-blue-300 w-16 h-16 rounded-full justify-center items-center shadow-lg"
      style={{
        shadowColor: '#3b82f6',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1001,
      }}
    >
      <Image source={icons.gpt} style={{ width: 32, height: 32 }} />
    </TouchableOpacity>
  );
};

export default AIButton;
