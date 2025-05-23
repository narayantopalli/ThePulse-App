import { View, Text, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import MyPostsFeedItem from "./MyPostsFeedItem";
import { useSession } from "@/contexts/SessionContext";
import AddPostButton from "../feed/AddPostButton";

const MyPostsFeed = () => {
  const { myPosts, setMyPosts } = useSession();

  if (myPosts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center mb-32">
        <Text className="text-2xl font-semibold text-gray-800 mb-2">No Posts Yet</Text>
        <Text className="text-base text-gray-500 text-center px-8 mb-4">
          Share your thoughts and experiences with the community
        </Text>
        <AddPostButton />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 mb-8"
    >
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MyPostsFeedItem 
            key={`${item.id}`} 
            post={item}
            onDelete={() => {
              setMyPosts(myPosts.filter((post) => post.id !== item.id));
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 125 }}
      />
    </KeyboardAvoidingView>
  );
};

export default MyPostsFeed;
