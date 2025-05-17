import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { router } from 'expo-router';

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

interface NotificationItemProps {
  item: any;
  onIgnore: (id: string) => void;
  currentUserId: string;
}

const NotificationItem = ({ item, onIgnore, currentUserId }: NotificationItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getNotificationText = () => {
    if (item.data.type === 'response') {
      return `responded: "${item.data.response_text}"`;
    } else if (item.data.type === 'poll_vote') {
      return `voted "${item.data.option_text}" on your poll`;
    }
    return 'interacted with your post';
  };

  const senderName = item.data.anonymous 
    ? 'Anonymous'
    : `${item.sender.firstname} ${item.sender.lastname}`;

  return (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className="flex-row items-center bg-white p-4 rounded-xl mb-3 border border-gray-200"
    >
      <View className="relative">
        <TouchableOpacity onPress={() => {
          if (!item.data.anonymous) {
            if (currentUserId === item.sender_id) {
              router.push('/profile');
            } else {
              router.push(
                {
                  pathname: `/(edit)/public-profile`,
                  params: {
                    userID: item.sender_id
                  }
                }
              );
            }
          }
        }}>
          <Image
            source={
              item.data.anonymous || !item.sender.avatar_url
                ? require("assets/images/avatar-default-icon.png")
                : { uri: item.sender.avatar_url }
            }
            className="w-12 h-12 rounded-full"
          />
        </TouchableOpacity>
        <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-black font-bold text-[15px]">{senderName}</Text>
          <Text className="text-gray-400 text-xs font-medium">
            {formatTimeAgo(new Date(item.created_at))}
          </Text>
        </View>
        <Text className="text-gray-600 mt-1 text-[14px] leading-5">
          {getNotificationText()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onIgnore(item.id)}
        className="ml-3 p-2 bg-gray-50 rounded-full active:bg-gray-100"
      >
        <Text className="text-gray-500 font-medium text-sm">Dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationItem;
