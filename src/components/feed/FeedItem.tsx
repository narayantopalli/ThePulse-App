import { View, Text, Image, TouchableOpacity, TextInput, FlatList } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import TextPostContent from "./items/TextPostContent";
import PollPostContent from "./items/PollPostContent";
import ResponsePostContent from "./items/ResponsePostContent";

interface FeedItemProps {
  onFocus: (rowId: string) => void;
  inputRefs: React.RefObject<Record<string, TextInput | null>>;
  post: {
    id: string;
    user_id: string;
    created_at: string;
    data: {
      type: 'text' | 'poll' | 'response';
      image_url?: string;
      post_data: {
        caption: string;
        options?: string[];
      };
    };
    user_data: any;
    visibility_radius?: number | null;
    location_string: string;
    latitude: number;
    longitude: number;
    anonymous: boolean;
  };
}

const FeedItem = ({ post, onFocus, inputRefs }: FeedItemProps) => {
  const { userMetadata } = useSession();

  if (!post) {
    return null;
  }

  const renderPostContent = () => {
    switch (post.data.type) {
      case 'text':
        return <TextPostContent caption={post.data.post_data.caption} user_id={post.user_id} />;
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
            pathname: post.user_id === userMetadata?.id ? "/profile" : "/(edit)/public-profile", 
            params: {userID: post.user_id}
          }) : null}
          className="relative"
        >
          <Image
            source={
              post.user_data.avatar_url
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
          <Text className="text-black font-JakartaSemiBold text-xl">
            {post.user_id === userMetadata?.id 
              ? `Me` 
              : `${post.user_data.first_name || ''} ${post.user_data.last_name || ''}`}
          </Text>
          <View className="flex-row items-center flex-wrap">
            <Text className="text-gray-500 text-sm">
              {new Date(post.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })}
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
    </View>
  );
};

export default FeedItem;
