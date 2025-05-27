import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GroupListHeaderProps } from '@/types/type';

const GroupListHeader = ({ onCreatePress }: GroupListHeaderProps) => (
  <TouchableOpacity
    onPress={onCreatePress}
    className="mb-4 px-5 py-3 bg-amber-700 rounded-xl shadow-sm active:bg-amber-800 flex-row items-center justify-center space-x-2"
  >
    <MaterialCommunityIcons name="account-group" size={24} color="white" />
    <Text className="ml-2 text-white text-base font-JakartaSemiBold">
      Form A New Tribe
    </Text>
  </TouchableOpacity>
);

export default GroupListHeader; 
