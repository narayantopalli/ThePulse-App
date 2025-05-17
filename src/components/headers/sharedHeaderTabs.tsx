import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { MaterialIcons } from "@expo/vector-icons";
import { getLocationString } from "@/hooks/getLocationString";
import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";

interface SharedHeaderTabsProps {
  title?: string;
  whichIcon?: number;
  showLocation?: boolean;
}

const SharedHeaderTabs = ({ title, whichIcon, showLocation }: SharedHeaderTabsProps) => {
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
    <View className="flex-row items-center justify-between bg px-4 h-12">
      <View className="flex-1">
        {title ? (
          <Text className="text-black text-lg font-JakartaMedium" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Text className="text-[#FF6B6B] text-2xl font-JakartaExtraBold tracking-wide mb-1" numberOfLines={1}>
            ThePulse
          </Text>
        )}
      </View>
      {showLocation && (
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-gray-500 text-lg" numberOfLines={1}>
            {locationString}
          </Text>
        </View>
      )}
      <View className="w-10 items-end">
        {whichIcon === 0 && (
          <TouchableOpacity onPress={() => router.replace("/profile")}>
            <SmallProfilePhoto isAnonymous={isAnonymous} />
          </TouchableOpacity>
        )}
        {whichIcon === 1 && (
          <TouchableOpacity onPress={() => router.replace("/settings")}>
            <MaterialIcons name="settings" size={34} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SharedHeaderTabs;
