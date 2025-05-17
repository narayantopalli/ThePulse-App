import { View, Text, Image } from "react-native";
import TextPostContent from "./items/MyPostTextPostContent";
import PollPostContent from "./items/MyPostPollPostContent";
import MyPostResponsePostContent from "./items/MyPostResponsePostContent";

const MyPostsFeedItem = ({ post }: { post: any }) => {

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
        return <MyPostResponsePostContent caption={post.data.post_data.caption} user_id={post.user_id} postId={post.id} />;
    }
  };

  console.log("post", post);

  return (
    <View className="mt-3 mx-4">
      <View className="rounded-3xl p-5 shadow-lg border-2 border-gray-400">
        <View className="bg-white/95 rounded-2xl p-4">
          <View className="flex-row items-center mb-3">
            <View className="ml-3 flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-gray-600 text-sm font-medium">
                  {new Date(post.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </Text>
                {post.location_string && (
                  <Text className="text-gray-600 text-sm ml-2 font-medium">
                    •  {post.location_string}
                  </Text>
                )}
              </View>
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
