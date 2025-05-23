import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getLocationString } from "@/hooks/getLocationString";
import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { SharedHeaderTabsProps } from "@/types/type";

const SharedHeaderTabs = ({ title, whichIcon, showLocation, isDarkMode }: SharedHeaderTabsProps) => {
  const { location, isAnonymous } = useSession();
  const [locationString, setLocationString] = useState<string>("Location not available");

  useEffect(() => {
    const fetchLocationString = async () => {
      if (location) {
        const locationStr = await getLocationString(location);
        setLocationString(locationStr);
      }
    };
    fetchLocationString();
  }, [location]);

  return (
    <View className={`flex-row items-center justify-between ${isDarkMode ? 'bg-black' : 'bg-white'} px-4 h-12`}>
      {whichIcon !== 2 && (
        <View className={`${whichIcon === 2 ? 'flex-1 items-center' : 'flex-1'}`}>
          {title ? (
            <Text className={`${isDarkMode ? 'text-white' : 'text-black'} text-lg font-JakartaMedium`} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <Text className="text-[#FF6B6B] text-2xl font-JakartaExtraBold tracking-wide mb-1" numberOfLines={1}>
              ThePulse
            </Text>
          )}
        </View>
      )}
      {showLocation && (
        <View className="absolute left-0 right-0 items-center">
          <Text className={`${isDarkMode ? 'text-gray-200 text-xl' : 'text-gray-500 text-lg'}`} numberOfLines={1}>
            {locationString}
          </Text>
        </View>
      )}
      {whichIcon !== 2 && (
        <View className="w-10 items-end">
          {whichIcon === 0 && (
            <TouchableOpacity onPress={() => router.replace({ pathname: "/my-posts", params: { goBackPath: `/(root)/(tabs)/${title ? title.toLowerCase() : "home"}`} })}>
              <MaterialIcons name="collections" size={34} color={isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
            </TouchableOpacity>
          )}
          {whichIcon === 1 && (
            <TouchableOpacity onPress={() => router.replace("/settings")}>
              <MaterialIcons name="settings" size={34} color="black" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default SharedHeaderTabs;
