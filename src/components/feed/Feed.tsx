import { View, Text, FlatList, KeyboardAvoidingView, Platform, Keyboard, TextInput, Dimensions } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";
import FeedItem from "./FeedItem";

interface Post {
  id: string;
  user_id: string;
  created_at: string;
  data: {
    type: "text" | "poll" | "response";
    image_url?: string;
    post_data: {
      caption: string;
      options?: string[];
    };
  };
  user_data: {
    username: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
  liked: boolean;
  anonymous: boolean;
  location_string: string;
  latitude: number;
  longitude: number;
}

const Feed = () => {
  const { userMetadata, location } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const listRef = useRef<FlatList<any>>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    const loadPosts = async () => {
      if (userMetadata?.id) {
        try {
          const storedPosts = await AsyncStorage.getItem(`feed_${userMetadata.id}`);
          if (storedPosts) {
            const parsedPosts = JSON.parse(storedPosts);
            const filteredPosts = parsedPosts.filter((post: Post) => post.user_id !== userMetadata.id);
            setPosts(filteredPosts);
          }
        } catch (error) {
          console.error('Error reading from local storage:', error);
        }
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, [location]);

  const focusRow = (rowId: string) => {
    const rowIndex = posts.findIndex(d => d.id === rowId);
    if (rowIndex !== -1) {
      listRef.current?.scrollToIndex({index: rowIndex, animated: true});
    }
    setTimeout(() => {
      inputRefs.current[rowId]?.focus();
    }, 250);
  };

  if (loadingPosts) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-black">Loading feed...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-black">Feed is empty</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 mb-8"
    >
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FeedItem 
            onFocus={focusRow}
            inputRefs={inputRefs}
            key={`${item.id}`} 
            post={item} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 125 }}
      />
    </KeyboardAvoidingView>
  );
};

export default Feed;
