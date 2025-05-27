import { View, Text, FlatList, KeyboardAvoidingView, Platform, Keyboard, TextInput, Dimensions, RefreshControl } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect, useRef } from "react";
import FeedItem from "@/components/feed/FeedItem";
import { resetFeed } from "@/utils/nextFeed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FeedHeader from "@/components/feed/FeedHeader";

const Home = () => {
  const { feed, setFeed, session, location, searchRadius, blockedPosts, userMetadata, channel } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    if (feed.length === 0 && location) {
      (async () => {
        const newFeed = await resetFeed(session, location[0], location[1], searchRadius, blockedPosts, 10, channel);
        setFeed(newFeed);
        AsyncStorage.setItem(`feed_${channel}_${userMetadata?.id}`, JSON.stringify(newFeed));
      })();
    }
  }, []);

  useEffect(() => {
    getFeedFromLocalStorage();
    if (location) {
      (async () => {
        const newFeed = await resetFeed(session, location[0], location[1], searchRadius, blockedPosts, 10, channel);
        setFeed(newFeed);
        AsyncStorage.setItem(`feed_${channel}_${userMetadata?.id}`, JSON.stringify(newFeed));
      })();
    }
  }, [searchRadius, channel]);

  const getFeedFromLocalStorage = async () => {
    const feed = await AsyncStorage.getItem(`feed_${channel}_${userMetadata?.id}`);
    if (feed) setFeed(JSON.parse(feed));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      const newFeed = await resetFeed(session, location[0], location[1], searchRadius, blockedPosts, 10, channel);
      setFeed(newFeed);
      AsyncStorage.setItem(`feed_${channel}_${userMetadata?.id}`, JSON.stringify(newFeed));
    }
    setRefreshing(false);
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
      <FeedHeader />
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
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-lg">No available feed</Text>
            <Text className="text-gray-400 text-sm mt-2">Swipe down to refresh</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FeedItem 
            onFocus={focusRow}
            inputRefs={inputRefs}
            key={`${item.id}`} 
            post={item} 
          />
        )}
        contentContainerStyle={{ paddingTop: 50, paddingBottom: 125 }}
      />
    </KeyboardAvoidingView>
  );
};

export default Home;
