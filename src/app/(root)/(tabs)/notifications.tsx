import { View, Text, FlatList, RefreshControl } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import NotificationItem from "@/components/NotificationItem";

const Notifications = () => {
  const { loading, userMetadata } = useSession();
  const [notifications, setNotifications] = useState([]);
  const {
    handleIgnore,
    fetchNotifications
  } = useNotifications(notifications, setNotifications);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  if (loading || !userMetadata?.id) return null;

  return (
    <View className="flex-1 bg-general-300">
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
              onIgnore={handleIgnore}
              currentUserId={userMetadata.id}
            />
          )}
        />
      </View>
    </View>
  );
};

export default Notifications;
