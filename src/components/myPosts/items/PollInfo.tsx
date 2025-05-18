import { PollVote } from "@/types/type";
import { getLocalImageURI } from "@/utils/getImage";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator, FlatList, Image } from "react-native";
import { Modal } from "react-native";

const PollInfo = ({ 
  showPollInfo, 
  setShowPollInfo, 
  options,
  postId 
}: { 
  showPollInfo: boolean, 
  setShowPollInfo: (showPollInfo: boolean) => void, 
  caption: string,
  totalVotes: number, 
  options: string[], 
  pollVotes: any[],
  postId: string
}) => {

  const [loading, setLoading] = useState(false);
  const [userPollVotes, setUserPollVotes] = useState<PollVote[]>([]);

  useEffect(() => {
    const fetchUserPollVotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          id,
          option_index,
          created_at,
          anonymous,
          user_data:profiles!polls_id_fkey (
            firstname,
            lastname,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching poll votes:', error);
        return;
      }

      const typedData = data as unknown as PollVote[];
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
      
      setUserPollVotes(updatedData as PollVote[]);
      setLoading(false);
    }
    fetchUserPollVotes();
  }, [postId]);

  const renderVoteItem = ({ item }: { item: PollVote }) => {
    
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
            Voted: {options[item.option_index]}
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
      visible={showPollInfo}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPollInfo(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px] max-h-[50%] flex-1">
          <Text className="text-xl font-JakartaSemiBold mb-4">Poll Results</Text>
          <FlatList
            data={userPollVotes}
            renderItem={renderVoteItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity 
            onPress={() => setShowPollInfo(false)}
            className="bg-blue-500 px-4 py-2 rounded-lg mt-4 self-end"
          >
            <Text className="text-white font-JakartaMedium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PollInfo;
