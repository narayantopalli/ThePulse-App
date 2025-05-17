import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { UUIDhash } from "@/utils/hash";

interface PollVote {
  option_index: number;
  count: number;
  user_vote?: number;
}

interface PollPostContentProps {
  postId: string;
  user_id: string;
  caption: string;
  options: string[];
}

const PollPostContent = ({ postId, user_id, caption, options }: PollPostContentProps) => {
  const { userMetadata, isAnonymous } = useSession();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Get user's vote if any
      const { data: userVote, error: userError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('post_id', postId)
        .eq('id', userMetadata?.id)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      // Initialize votes array with all options
      const votes: PollVote[] = options.map((_, index) => ({
        option_index: index,
        count: voteCountsMap.get(index) || 0,
        user_vote: undefined
      }));

      // Set user's vote if exists
      if (userVote) {
        const index = votes.findIndex(v => v.option_index === userVote.option_index);
        if (index !== -1) {
          votes[index].user_vote = userVote.option_index;
          setSelectedOption(userVote.option_index);
        }
      }

      setPollVotes(votes);
    } catch (error) {
      console.error('Error fetching poll votes:', error);
    }
  };

  const submitVote = async (optionIndex: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Add new vote
      const { error } = await supabase
        .from('poll_votes')
        .upsert({
          post_id: postId,
          id: userMetadata?.id,
          option_index: optionIndex
        });

      if (error) throw error;

      // delete old notification
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('post_id', postId)
        .or(`sender_id.eq.${UUIDhash(userMetadata?.id)},sender_id.eq.${userMetadata?.id}`);

      if (deleteError) throw deleteError;
      
      // Add new notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          post_id: postId,
          user_id: user_id,
          sender_id: isAnonymous ? UUIDhash(userMetadata?.id) : userMetadata?.id,
          data: {
            anonymous: isAnonymous,
            type: 'poll_vote',
            option_text: options[optionIndex],
          }
        });

      if (notificationError) throw notificationError;
      setSelectedOption(optionIndex);
      await fetchPollVotes(); // Refresh votes
    } catch (error) {
      
console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = pollVotes.reduce((sum, vote) => sum + vote.count, 0);

  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <Text className="text-black text-lg font-JakartaSemiBold mb-4">
        {caption}
      </Text>
      {options.map((option, index) => {
        const vote = pollVotes.find(v => v.option_index === index);
        const percentage = totalVotes > 0 ? (vote?.count || 0) / totalVotes * 100 : 0;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => submitVote(index)}
            disabled={isSubmitting}
            className={`p-3 rounded-xl mb-2 border ${
              selectedOption === index 
                ? 'bg-blue-100 border-blue-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-black font-JakartaMedium flex-1">
                {option}
              </Text>
              {selectedOption !== null && (
                <Text className="text-gray-500 text-sm ml-2">
                  {vote?.count || 0} votes ({percentage.toFixed(0)}%)
                </Text>
              )}
            </View>
            {totalVotes > 0 && selectedOption !== null && (
              <View className="h-1 bg-gray-200 rounded-full mt-2">
                <View 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      <Text className="text-gray-500 text-sm mt-2">
        Total votes: {totalVotes}
      </Text>
    </View>
  );
};

export default PollPostContent;
