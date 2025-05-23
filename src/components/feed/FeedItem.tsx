import { View, Text, Image, TouchableOpacity, TextInput, FlatList } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import TextPostContent from "./items/TextPostContent";
import PollPostContent from "./items/PollPostContent";
import ResponsePostContent from "./items/ResponsePostContent";
import { FeedItemProps } from "@/types/type";
import ReportButton from "../ReportButton";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { formatTimeAgo } from "@/hooks/formatTimeAgo";
const FeedItem = ({ post, onFocus, inputRefs }: FeedItemProps) => {
  const { userMetadata } = useSession();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  if (!post) {
    return null;
  }

  const getLikes = async () => {
    const { data, error } = await supabase.from('likes').select('user_id').eq('post_id', post.id);
    if (error) {
      console.error('Error getting likes:', error);
    }
    setLiked(data?.some((like) => like.user_id === userMetadata?.id) || false);
    setLikes(data?.length || 0);
  }

  const handleLike = async () => {
    const { error } = await supabase.from('likes').insert({ user_id: userMetadata?.id, post_id: post.id });
    if (error) {
      console.error('Error liking post:', error);
    }
    getLikes();
  }

  const handleUnlike = async () => {
    const { error } = await supabase.from('likes').delete().eq('user_id', userMetadata?.id).eq('post_id', post.id);
    if (error) {
      console.error('Error unliking post:', error);
    }
    getLikes();
  }

  useEffect(() => {
    getLikes();
  }, []);

  const renderPostContent = () => {
    switch (post.data.type) {
      case 'text':
        return <TextPostContent caption={post.data.post_data.caption} user_id={post.user_id} postId={post.id} />;
      case 'poll':
        return (
          <PollPostContent
            postId={post.id}
            user_id={post.user_id}
            caption={post.data.post_data.caption}
            options={post.data.post_data.options || []}
          />
        );
      case 'response':
        return <ResponsePostContent caption={post.data.post_data.caption} user_id={post.user_id} postId={post.id} onFocus={onFocus} inputRefs={inputRefs}/>;
    }
  };

  return (
    <View className="bg-white rounded-3xl p-5 mt-3 mx-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <TouchableOpacity 
          onPress={() => !post.anonymous ? router.push({
            pathname: post.user_id === userMetadata?.id ? "/profile" : "/(root)/(edit)/public-profile", 
            params: {userID: post.user_id}
          }) : null}
          className="relative"
        >
          <Image
            source={
              !post.anonymous
                ? { uri: post.user_data.avatar_url }
                : require("assets/images/avatar-default-icon.png")
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderColor: "black",
              borderWidth: 1,
            }}
          />
          {post.data.type === 'text' && (
            <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
              <FontAwesome6 name="comment-dots" size={12} color="white" />
            </View>
          )}
          {post.data.type === 'poll' && (
            <View className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1">
              <FontAwesome6 name="chart-simple" size={12} color="white" />
            </View>
          )}
          {post.data.type === 'response' && (
            <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
              <FontAwesome6 name="comments" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="text-black font-JakartaSemiBold text-xl">
              {post.anonymous ? "Anonymous" : `${post.user_data.firstname || ''}`}
            </Text>
            <ReportButton postId={post.id} />
          </View>
          <View className="flex-row items-center flex-wrap">
            <Text className="text-gray-500 text-sm">
              {formatTimeAgo(new Date(post.created_at))}
            </Text>
            {post.location_string && (
              <Text className="text-gray-500 text-sm ml-2">
                •  {post.location_string}
              </Text>
            )}
          </View>
        </View>
      </View>

      {post.data.image_url && (
        <View className="mx-16 mb-4">
          <Image
            source={{ uri: post.data.image_url }}
            className="w-full aspect-[5/7] rounded-2xl shadow-sm"
            resizeMode="cover"
          />
        </View>
      )}

      {renderPostContent()}

      <View className="flex-row items-center mt-4 justify-end">
        <TouchableOpacity 
          onPress={liked ? handleUnlike : handleLike}
          className="flex-row items-center"
        >
          <FontAwesome6 
            name="heart" 
            size={20} 
            color={liked ? "#ef4444" : "#6b7280"}
            solid={liked}
          />
          <Text className="ml-2 text-gray-600 font-JakartaMedium">
            {likes} {likes === 1 ? 'like' : 'likes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FeedItem;
