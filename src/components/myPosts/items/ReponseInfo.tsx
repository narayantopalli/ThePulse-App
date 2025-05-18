import { Responses } from "@/types/type";
import { getLocalImageURI } from "@/utils/getImage";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, FlatList, Image } from "react-native";
import { Modal } from "react-native";

const ReponseInfo = ({ 
  postId,
  showResponseInfo,
  setShowResponseInfo
}: { 
  postId: string,
  showResponseInfo: boolean,
  setShowResponseInfo: (showResponseInfo: boolean) => void
}) => {

  const [loading, setLoading] = useState(false);
  const [userResponses, setUserResponses] = useState<Responses[]>([]);

  useEffect(() => {
    const fetchUserResponses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('responses')
        .select(`
          id,
          created_at,
          post_id,
          anonymous,
          response,
          user_data:profiles!responses_user_id_fkey (
            firstname,
            lastname,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching responses:', error);
        return;
      }

      const typedData = data as unknown as Responses[];
      const avatarUrls = typedData?.map((item) => item.user_data?.avatar_url);
      const localImages = await Promise.all(avatarUrls?.map((url) => url ? getLocalImageURI(url) : null) || []);
      
      // Update the user_data with local image URIs
      const updatedData = typedData?.map((item, index) => ({
        ...item,
        user_data: item.user_data ? {
          ...item.user_data,
          avatar_url: localImages[index] || item.user_data.avatar_url
        } : null
      })) || [];
      
      setUserResponses(updatedData as Responses[]);
      setLoading(false);
    }
    fetchUserResponses();
  }, [postId]);

  const renderResponseItem = ({ item }: { item: Responses }) => {
    const userName = item.anonymous 
      ? 'Anonymous'
      : `${item.user_data?.firstname} ${item.user_data?.lastname}`;
    
    return (
      <View className="flex-row items-center p-3 border-b border-gray-100">
        <Image
          source={
            item.user_data?.avatar_url && !item.anonymous
              ? { uri: item.user_data.avatar_url }
              : require("assets/images/avatar-default-icon.png")
          }
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-JakartaMedium text-gray-800">{userName}</Text>
          <Text className="text-gray-500 text-sm">
            Response: {item.response}
          </Text>
        </View>
        <Text className="text-gray-400 text-xs">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return null;
  }
    
  return (
    <Modal
      visible={showResponseInfo}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowResponseInfo(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px] max-h-[50%] flex-1">
          <Text className="text-xl font-JakartaSemiBold mb-4">Responses</Text>
          <FlatList
            data={userResponses}
            renderItem={renderResponseItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity 
            onPress={() => setShowResponseInfo(false)}
            className="bg-blue-500 px-4 py-2 rounded-lg mt-4 self-end"
          >
            <Text className="text-white font-JakartaMedium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReponseInfo;
