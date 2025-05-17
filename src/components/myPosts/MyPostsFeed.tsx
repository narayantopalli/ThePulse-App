import { View, Text, FlatList, KeyboardAvoidingView, Platform, Keyboard, TextInput, Dimensions } from "react-native";
import { supabase } from "@/utils/supabase";
import { getLocalImageURI } from "@/utils/getImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import MyPostsFeedItem from "./MyPostsFeedItem";
import { UUIDhash } from "@/utils/hash";
import { useSession } from "@/contexts/SessionContext";

const MyPostsFeed = () => {
  const { userMetadata } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const loadPostsFromDatabase = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`user_id.eq.${userMetadata?.id},user_id.eq.${UUIDhash(userMetadata?.id)}`)
        .order('created_at', { ascending: false });

      if (data) {
        const postsWithImage = await Promise.all(
          data.map(async (post) => ({
            ...post,
            image_url: post.data.image_url ? await getLocalImageURI(post.data.image_url) : null
          }))
        );
        setPosts(postsWithImage);
        if (userMetadata?.id) {
          await AsyncStorage.setItem(`my_posts_${userMetadata.id}`, JSON.stringify(postsWithImage));
        }
      }
    }
    const loadPostsFromLocalStorage = async () => {
      if (userMetadata?.id) {
        try {
          const storedPosts = await AsyncStorage.getItem(`my_posts_${userMetadata.id}`);
          if (storedPosts) {
            setPosts(JSON.parse(storedPosts));
          }
        } catch (error) {
          console.error('Error reading from local storage:', error);
        }
        setLoadingPosts(false);
      }
    };
    loadPostsFromLocalStorage();
    loadPostsFromDatabase();
  }, [location]);

  if (loadingPosts) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-black">Loading my posts...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-black">No posts yet</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 mb-8"
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MyPostsFeedItem 
            key={`${item.id}`} 
            post={item} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 125 }}
      />
    </KeyboardAvoidingView>
  );
};

export default MyPostsFeed;
