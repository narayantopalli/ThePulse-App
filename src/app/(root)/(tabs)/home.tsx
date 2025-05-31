import { View, Text, FlatList, KeyboardAvoidingView, Platform, Keyboard, TextInput, Dimensions, RefreshControl, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect, useRef } from "react";
import FeedItem from "@/components/feed/FeedItem";
import { getFeed } from "@/utils/nextFeed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FeedHeader from "@/components/feed/FeedHeader";
import VibeScreen from "@/components/vibe/vibeScreen";
import { Ionicons } from '@expo/vector-icons';

const POSTS_PER_PAGE = 10;

const Home = () => {
  const { feed, setFeed, session, location, searchRadius, blockedPosts, userMetadata, channel, showVibe, setShowVibe } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMoreFeed, setIsMoreFeed] = useState(true);
  const listRef = useRef<FlatList<any>>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const [colorGradient, setColorGradient] = useState<string>('rgba(0,0,0,0.0)');

  useEffect(() => {
    getFeedFromLocalStorage();
    if (location) {
      loadInitialFeed();
    }
  }, [searchRadius, channel]);

  const loadInitialFeed = async () => {
    if (location) {
      setIsMoreFeed(true);
      const newFeed = await getFeed(session, [], location[0], location[1], searchRadius, blockedPosts, POSTS_PER_PAGE, channel);
      setFeed(newFeed);
      AsyncStorage.setItem(`feed_${channel}_${userMetadata?.id}`, JSON.stringify(newFeed));
    }
  };

  const getFeedFromLocalStorage = async () => {
    const feed = await AsyncStorage.getItem(`feed_${channel}_${userMetadata?.id}`);
    if (feed) setFeed(JSON.parse(feed));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialFeed();
    setRefreshing(false);
  };

  const loadMoreFeed = async () => {
    if (loading || !location || !isMoreFeed || feed.length === 0) return;
    
    setLoading(true);
    const newFeed = await getFeed(
      session,
      feed,
      location[0],
      location[1],
      searchRadius,
      blockedPosts,
      POSTS_PER_PAGE,
      channel
    );

    if (newFeed === feed) {
      setIsMoreFeed(false);
      setLoading(false);
      return;
    }

    setFeed(newFeed);
    AsyncStorage.setItem(
      `feed_${channel}_${userMetadata?.id}`,
      JSON.stringify(newFeed)
    );
    setLoading(false);
  };

  const focusRow = (rowId: string) => {
    const rowIndex = feed.findIndex(d => d.id === rowId);
    if (rowIndex !== -1) {
      listRef.current?.scrollToIndex({index: rowIndex, animated: true});
    }
    setTimeout(() => {
      inputRefs.current[rowId]?.focus();
    }, 250);
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 mb-8"
    >
      <FlatList
        ref={listRef}
        data={feed}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000000"]}
            tintColor="#000000"
          />
        }
        onEndReached={loadMoreFeed}
        onEndReachedThreshold={1.0}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-lg">No available feed</Text>
            <Text className="text-gray-400 text-sm mt-2">Swipe down to refresh</Text>
          </View>
        )}
        ListFooterComponent={() => (
          loading ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#000000" />
            </View>
          ) : null
        )}
        renderItem={({ item }) => (
          <FeedItem 
            onFocus={focusRow}
            inputRefs={inputRefs}
            key={`${item.id}`} 
            post={item} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 125 }}
        contentInset={{ top: 60 }}
        contentOffset={{ y: -60, x: 0 }}
      />
      <FeedHeader />
      <Modal
        visible={showVibe}
        onRequestClose={() => setShowVibe(false)}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] h-[75%] bg-white rounded-xl overflow-hidden">
            <TouchableOpacity 
              onPress={() => setShowVibe(false)}
              className="absolute right-4 top-4 z-10"
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <VibeScreen colorGradient={colorGradient} setColorGradient={setColorGradient} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Home;
