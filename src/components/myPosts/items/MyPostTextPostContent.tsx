import { Text, View } from "react-native";
import { TextPostContentProps } from "@/types/type";

const TextPostContent = ({ caption, user_id }: TextPostContentProps) => {

  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <Text className="text-black text-xl font-JakartaMedium">
        {caption}
      </Text>
    </View>
  );
};

export default TextPostContent; 