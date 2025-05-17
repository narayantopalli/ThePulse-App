import { Text, View, TextInput, TouchableOpacity, Keyboard, FlatList } from "react-native";
import { useState, forwardRef } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/utils/supabase";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { UUIDhash } from "@/utils/hash";

interface ResponsePostContentProps {
  caption: string;
  user_id: string;
  postId: string;
  inputRefs: React.RefObject<Record<string, TextInput | null>>;
  onFocus: (rowId: string) => void;
}

const ResponsePostContent = ({ caption, user_id, postId, inputRefs, onFocus }: ResponsePostContentProps) => {
  const { userMetadata, isAnonymous } = useSession();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitResponse = async () => {
    if (isSubmitting || !response.trim()) return;
    setIsSubmitting(true);

    try {
      // Add response to database
      const { error } = await supabase
        .from('responses')
        .insert({
          post_id: postId,
          user_id: userMetadata?.id,
          response: response.trim()
        });

      if (error) throw error;

      // Add notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          post_id: postId,
          user_id: user_id,
          sender_id: isAnonymous ? UUIDhash(userMetadata?.id) : userMetadata?.id,
          data: {
            anonymous: isAnonymous,
            type: 'response',
            response_text: response.trim()
          }
        });

      if (notificationError) throw notificationError;

      setResponse("");
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-amber-50 rounded-2xl p-4">
      <Text className="text-black font-JakartaMedium mb-4">
        {caption}
      </Text>
      
      <View className="bg-white rounded-xl p-3 mb-3">
        <TextInput
          ref={el => inputRefs.current[postId] = el}
          onFocus={() => onFocus(postId)}
          className="text-black text-base font-JakartaMedium min-h-[80px]"
          placeholder="Write your response..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={response}
          onChangeText={(text) => {
            const cleanText = text.replace(/\n/g, '');
            setResponse(cleanText);
          }}
          maxLength={500}
          style={{ textAlignVertical: 'top' }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Enter') {
              if (inputRefs.current[postId]) {
                inputRefs.current[postId]?.blur();
              }
              Keyboard.dismiss();
            }
          }}
        />
        <View className="flex-row justify-end">
          <Text className="text-gray-400 text-sm font-JakartaRegular">
            {response.length}/500
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={submitResponse}
        disabled={!response.trim() || isSubmitting}
        className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${
          !response.trim() || isSubmitting
            ? 'bg-gray-200'
            : 'bg-amber-500'
        }`}
      >
        <FontAwesome6 
          name="paper-plane" 
          size={16} 
          color={!response.trim() || isSubmitting ? "#9CA3AF" : "white"} 
          className="mr-2"
        />
        <Text 
          className={`font-JakartaMedium text-base ${
            !response.trim() || isSubmitting
              ? 'text-gray-400'
              : 'text-white'
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Response"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResponsePostContent; 