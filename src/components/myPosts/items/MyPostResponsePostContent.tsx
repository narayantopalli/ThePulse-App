import { Text, View, TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const MyPostResponsePostContent = ({ caption, user_id, postId }: { caption: string, user_id: string, postId: string }) => {

  return (
    <View className="bg-amber-50 rounded-2xl p-5 shadow-sm">
      <Text className="text-black font-JakartaMedium text-base leading-6 mb-4">
        {caption}
      </Text>
      <TouchableOpacity>
        <View className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500 text-sm font-JakartaMedium">
              View Responses
            </Text>
            <FontAwesome6 name="chevron-right" size={12} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MyPostResponsePostContent;
