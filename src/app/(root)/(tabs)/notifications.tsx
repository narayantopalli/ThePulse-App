import { View, Text, FlatList } from "react-native";
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

  useEffect(() => {
    if (userMetadata?.id) {
      fetchNotifications();
      console.log("notifications:", notifications);
    }
  }, [userMetadata?.id]);

  if (loading || !userMetadata?.id) return null;

  return (
    <View className="flex-1 bg-general-300">
      <View className="flex-1 px-4 mt-4">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center mt-[50%]">
            <Text className="text-black">No notifications!</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => Math.random().toString()}
            renderItem={({ item }) => (
              <NotificationItem
                item={item}
                onIgnore={handleIgnore}
                currentUserId={userMetadata.id}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

export default Notifications;
