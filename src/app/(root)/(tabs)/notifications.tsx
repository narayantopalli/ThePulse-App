import { View, Text, FlatList, RefreshControl } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { loadNotifications, handleIgnore, fetchNotifications } from "@/utils/getNotifications";
import { useEffect, useState } from "react";
import NotificationItem from "@/components/NotificationItem";

const Notifications = () => {
  const { loading, userMetadata, notifications, setNotifications } = useSession();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(userMetadata!, setNotifications);
    setRefreshing(false);
  };

  if (loading || !userMetadata?.id) return null;

  return (
    <View className="flex-1 px-4 mt-4">
      <FlatList
        data={notifications}
        keyExtractor={(item) => Math.random().toString()}
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
          <View className="flex-1 items-center justify-center py-8 mt-10">
            <Text className="text-gray-500 text-lg">No notifications yet!</Text>
            <Text className="text-gray-400 text-sm mt-2">Swipe down to refresh</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onIgnore={() => handleIgnore(item.id, notifications, setNotifications)}
            currentUserId={userMetadata.id}
          />
        )}
      />
    </View>
  );
};

export default Notifications;
