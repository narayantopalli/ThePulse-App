import { View, Text, Animated, Pressable } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import GroupSelector from "@/components/feed/GroupSelector";
import AnonymousToggle from "@/components/buttons/AnonymousToggle";
import VisibilityRadiusButton from "@/components/buttons/VisibilityRadiusButton";
import AddPostButton from "@/components/feed/AddPostButton";
import { useEffect, useState, useRef } from "react";
import { MaterialIcons } from '@expo/vector-icons';

const FeedHeader = () => {
  const { isAnonymous, setIsAnonymous, searchRadius, setSearchRadius } = useSession();
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const handleAnonymousToggle = (value: boolean) => {
    setIsAnonymous(value);
    if (value) {
      setShowToast(true);
    }
  };

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => setShowToast(false));
  };

  useEffect(() => {
    if (showToast) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <View className="bg-white py-2 rounded-b-3xl shadow-sm absolute top-0 left-0 right-0">
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row flex-1 items-center justify-between">
          <View className="bg-indigo-50 rounded-full p-2.5 shadow-sm">
            <GroupSelector />
          </View>
          <View className="flex-row items-center bg-violet-100 rounded-full p-1 px-2 shadow-sm">
            <AnonymousToggle 
              isAnonymous={isAnonymous}
              setIsAnonymous={handleAnonymousToggle}
            />
          </View>
          <View className="flex-row items-center">
            <VisibilityRadiusButton
              searchRadius={searchRadius}
              setSearchRadius={setSearchRadius}
            />
          </View>
          <View className="shadow-sm">
            <AddPostButton />
          </View>
        </View>
      </View>
      {showToast && (
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="absolute top-16 left-4 right-4 bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700"
        >
          <Pressable onPress={dismissToast}>
            <View className="flex-row items-center justify-center">
              <MaterialIcons className="ml-2 mr-1" name="visibility-off" size={20} color="#fff"/>
              <Text numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.5} className="text-white text-center font-medium mr-2">Anonymous mode: please stay respectful!</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

export default FeedHeader;
