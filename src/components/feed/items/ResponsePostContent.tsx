import { Text, View, TextInput, TouchableOpacity, Keyboard, Modal, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/utils/supabase";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ResponsePostContentProps } from "@/types/type";

const ResponsePostContent = ({ caption, user_id, postId, inputRefs, onFocus }: ResponsePostContentProps) => {
  const { userMetadata, isAnonymous } = useSession();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isModalVisible) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRefs.current[postId]?.focus();
      }, 100);
    }
  }, [isModalVisible]);

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
          response: response.trim(),
          anonymous: isAnonymous
        });

      if (error) throw error;

      // Add notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          post_id: postId,
          user_id: user_id,
          sender_id: userMetadata?.id,
          data: {
            anonymous: isAnonymous,
            type: 'response',
            response_text: response.trim()
          }
        });

      if (notificationError) throw notificationError;

      setResponse("");
      setIsModalVisible(false);
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
      
      <TouchableOpacity
        onPress={() => {
          setIsModalVisible(true);
        }}
        className="bg-white rounded-xl p-3 mb-3"
      >
        <Text className="text-gray-400 font-JakartaRegular text-lg">
          Write your response...
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? -100 : 0}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-3xl p-4 w-[90%] max-w-[500px] max-h-[80%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-JakartaMedium">{caption}</Text>
                <TouchableOpacity onPress={() => {
                  setIsModalVisible(false);
                  setResponse("");
                }}>
                  <FontAwesome6 name="xmark" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                ref={el => { inputRefs.current[postId] = el }}
                onFocus={() => onFocus(postId)}
                className="min-h-[80px] bg-gray-50 rounded-xl p-3 mb-3"
                placeholder="Write your response..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="sentences"
                autoComplete="off"
                autoCorrect={true}
                multiline
                value={response}
                onChangeText={(text) => {
                  const cleanText = text.replace(/\n/g, '');
                  setResponse(cleanText);
                }}
                maxLength={500}
                style={{
                  fontFamily: "font-JakartaRegular",
                  fontSize: 18,
                  color: "#333",
                  paddingVertical: 8,
                  textAlignVertical: 'top'
                }}
              />
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-400 text-sm font-JakartaRegular">
                  {response.length}/500
                </Text>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ResponsePostContent;
