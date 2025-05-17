import { TouchableOpacity, Text, View } from "react-native";

const GenderOption = ({ title, onPress, isSelected }: { title: string; onPress: () => void; isSelected: boolean }) => (
    <View className="m-1">
        <TouchableOpacity
        onPress={onPress}
        className={`border-2 border-black rounded-xl p-2 ${isSelected ? 'bg-primary-500' : 'bg-white'}`}
        >
        <Text className={`text-base font-JakartaMedium ${isSelected ? 'text-white' : 'text-black'}`}>
            {title}
        </Text>
        </TouchableOpacity>
    </View>
  );

export default GenderOption;
