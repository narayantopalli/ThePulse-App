import { View, Text } from "react-native";
import { ErrorMessageProps } from "@/types/type";

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  
  return (
    <View className="bg-red-50 p-4 rounded-lg mb-6 border border-red-100">
      <Text className="text-red-500 text-center font-JakartaMedium">
        {message}
      </Text>
    </View>
  );
};

export default ErrorMessage;
