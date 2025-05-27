import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSession } from "@/contexts/SessionContext";
import { SharedHeaderTabsProps } from "@/types/type";
import SearchForm from "../groups/searchForm";
import { useSearch } from "@/contexts/SearchContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback } from "react";

const headerStyles = {
  container: {
    zIndex: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  }
};

const SharedHeaderTabs = memo(({ title, whichIcon, showLocation }: SharedHeaderTabsProps) => {
  const { locationString } = useSession();
  const { query, setQuery } = useSearch();

  const handleVibePress = useCallback(() => {
    router.push("/(root)/(social)/vibe");
  }, []);

  const handleMyPostsPress = useCallback(() => {
    router.push("/(root)/(social)/my-posts");
  }, []);

  const handleSettingsPress = useCallback(() => {
    router.replace("/settings");
  }, []);

  const renderIcon = useCallback(() => {
    if (whichIcon === 2) return null;
    
    return (
      <View className="w-12 items-end">
        {whichIcon === 0 && (
          title ? (
            <TouchableOpacity 
              onPress={handleVibePress}
              className="p-2"
            >
              <MaterialIcons name="palette" size={28} color="#333" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleMyPostsPress}
              className="p-2"
            >
              <MaterialIcons name="collections" size={28} color="#333" />
            </TouchableOpacity>
          )
        )}
        {whichIcon === 1 && (
          <TouchableOpacity 
            onPress={handleSettingsPress}
            className="p-2"
          >
            <MaterialIcons name="settings" size={28} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [whichIcon, title, handleVibePress, handleMyPostsPress, handleSettingsPress]);

  return (
    <View className="bg-general-300">
      <SafeAreaView edges={["top"]} className="bg-white" style={headerStyles.container}>
        <View>
          <View className="flex-row items-center justify-between px-4 h-14">
            <View className="flex-1">
              {title ? (
                <Text className="text-black text-xl font-JakartaMedium" numberOfLines={1}>
                  {title === "Groups" ? "Tribes" : title}
                </Text>
              ) : (
                <Text className="text-[#FF6B6B] text-2xl font-JakartaExtraBold tracking-wide" numberOfLines={1}>
                  ThePulse
                </Text>
              )}
            </View>
            {showLocation && (
              <View className="absolute left-0 right-0 items-center">
                <View className="max-w-48 bg-gray-50 px-3 py-1 rounded-full">
                  <Text 
                    className="text-gray-600 text-base font-JakartaMedium" 
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {locationString}
                  </Text>
                </View>
              </View>
            )}
            {whichIcon === 2 ? (
              <View className="flex-1 items-end">
                <SearchForm 
                  query={query} 
                  setQuery={setQuery}
                />
              </View>
            ) : renderIcon()}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

SharedHeaderTabs.displayName = 'SharedHeaderTabs';

export default SharedHeaderTabs;
