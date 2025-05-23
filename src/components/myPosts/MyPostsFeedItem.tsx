import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import MyPostResponsePostContent from "./items/MyPostResponsePostContent";
import MyPostPollPostContent from "./items/MyPostPollPostContent";
import MyPostTextPostContent from "./items/MyPostTextPostContent";
import { Ionicons } from '@expo/vector-icons';
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { formatTimeAgo } from "@/hooks/formatTimeAgo";

const MyPostsFeedItem = ({ post, onDelete }: { post: any, onDelete?: () => void }) => {
  const [likes, setLikes] = useState(0);
  
  if (!post) {
    return null;
  }

  const getLikes = async () => {
    const { data, error } = await supabase.from('likes').select('*').eq('post_id', post.id);
    if (error) {
      console.error('Error getting likes:', error);
    }
    setLikes(data?.length || 0);
  }

  useEffect(() => {
    getLikes();
  }, []);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    }
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Post!",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDelete
        }
      ]
    );
  };

  const renderPostContent = () => {
    switch (post.data.type) {
      case 'text':
        return <MyPostTextPostContent caption={post.data.post_data.caption} user_id={post.user_id} postId={post.id} />;
      case 'poll':
        return (
          <MyPostPollPostContent
            postId={post.id}
            user_id={post.user_id}
            caption={post.data.post_data.caption}
            options={post.data.post_data.options || []}
          />
        );
      case 'response':
        return <MyPostResponsePostContent caption={post.data.post_data.caption} user_id={post.user_id} postId={post.id} />;
    }
  };

  return (
    <View className="mt-3 mx-4">
      <View className="rounded-3xl p-5 shadow-lg border-2 border-gray-400">
        <View className="bg-white/95 rounded-2xl p-4">
          <View className="flex-row items-center mb-3">
            <View className="ml-3 flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-gray-600 text-sm font-medium">
                  {formatTimeAgo(new Date(post.created_at))}
                </Text>
                {post.location_string && (
                  <Text className="text-gray-600 text-sm ml-2 font-medium">
                    •  {post.location_string}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <Ionicons name="heart" size={16} color="#FF4B91" />
                <Text className="text-gray-600 text-sm ml-1">{likes || 0}</Text>
              </View>
              <TouchableOpacity 
                onPress={showDeleteConfirmation}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#FF4B91" />
              </TouchableOpacity>
            </View>
          </View>

          {post.image_url && (
            <View className="mx-4 mb-4">
              <Image
                source={{ uri: post.image_url }}
                className="w-full aspect-[5/7] rounded-2xl shadow-lg border-2 border-pink-100"
                resizeMode="cover"
              />
            </View>
          )}

          <View className="bg-white/90 rounded-xl p-3 border border-pink-100">
            {renderPostContent()}
          </View>
          
          
        </View>
      </View>
    </View>
  );
};

export default MyPostsFeedItem;
