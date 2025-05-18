import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import PollInfo from "./PollInfo";

const MyPostPollPostContent = ({ postId, user_id, caption, options }: { postId: string, user_id: string, caption: string, options: string[] }) => {
  const [pollVotes, setPollVotes] = useState<any[]>([]);
  const [showPollInfo, setShowPollInfo] = useState(false);

  useEffect(() => {
    fetchPollVotes();
  }, [postId]);

  const fetchPollVotes = async () => {
    try {
      // Get total votes for each option
      const { data: voteCounts, error: countError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('post_id', postId);

      if (countError) throw countError;

      // Count votes for each option
      const voteCountsMap = new Map<number, number>();
      voteCounts?.forEach((vote: { option_index: number }) => {
        const currentCount = voteCountsMap.get(vote.option_index) || 0;
        voteCountsMap.set(vote.option_index, currentCount + 1);
      });

      // Initialize votes array with all options
      const votes: any[] = options.map((_, index) => ({
        option_index: index,
        count: voteCountsMap.get(index) || 0
      }));

      setPollVotes(votes);
    } catch (error) {
      console.error('Error fetching poll votes:', error);
    }
  };

  const totalVotes = pollVotes.reduce((sum, vote) => sum + vote.count, 0);

  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-black text-lg font-JakartaSemiBold">
          {caption}
        </Text>
      </View>

      {options.map((option, index) => {
        const vote = pollVotes.find(v => v.option_index === index);
        const percentage = totalVotes > 0 ? (vote?.count || 0) / totalVotes * 100 : 0;
        
        return (
          <View
            key={index}
            className="p-3 rounded-xl mb-2 border bg-gray-50 border-gray-200"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-black font-JakartaMedium flex-1">
                {option}
              </Text>
              <Text className="text-gray-500 text-sm ml-2">
                {vote?.count || 0} votes ({percentage.toFixed(0)}%)
              </Text>
            </View>
            {totalVotes > 0 && (
              <View className="h-1 bg-gray-200 rounded-full mt-2">
                <View 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </View>
            )}
          </View>
        );
      })}

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500 text-sm mt-2">
          Total votes: {totalVotes}
        </Text>
        <TouchableOpacity 
            onPress={() => setShowPollInfo(true)}
            className="bg-blue-500 px-4 py-2 rounded-lg mt-2"
          >
          <Text className="text-white font-JakartaMedium">Poll Results</Text>
        </TouchableOpacity>
      </View>
      
      <PollInfo
        showPollInfo={showPollInfo}
        setShowPollInfo={setShowPollInfo}
        caption={caption} 
        totalVotes={totalVotes} 
        options={options} 
        pollVotes={pollVotes} 
        postId={postId} />
    </View>
  );
};

export default MyPostPollPostContent;
