import { Text, View, TouchableOpacity, TextProps } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSession } from "@/contexts/SessionContext";
import { SharedHeaderTabsProps } from "@/types/type";
import SearchForm from "../groups/searchForm";
import { useSearch } from "@/contexts/SearchContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback, useMemo } from "react";

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

const CollectionsIcon = memo(({ isDarkMode = false }: { isDarkMode?: boolean }) => (
  <TouchableOpacity 
    onPress={() => router.push("/(root)/(social)/my-posts")}
    className="p-2"
  >
    <MaterialIcons name="collections" size={28} color={isDarkMode ? "#ffffff" : "#333"} />
  </TouchableOpacity>
));

const SettingsIcon = memo(({ isDarkMode = false }: { isDarkMode?: boolean }) => (
  <TouchableOpacity 
    onPress={() => router.replace("/settings")}
    className="p-2"
  >
    <MaterialIcons name="settings" size={28} color={isDarkMode ? "#ffffff" : "#333"} />
  </TouchableOpacity>
));

const LocationView = memo(({ locationString, isDarkMode = false }: { locationString: string; isDarkMode?: boolean }) => (
  <View className="absolute left-0 right-0 items-center">
    <View className={`px-3 py-1 rounded-full ${isDarkMode ? "max-w-64 bg-gray-800" : "max-w-48 bg-gray-50"}`}>
      <Text 
        className={`font-JakartaMedium ${isDarkMode ? "text-white text-xl" : "text-gray-600 text-lg"}`} 
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {locationString}
      </Text>
    </View>
  </View>
));

const TitleView = memo(({ title, isDarkMode = false }: { title?: string; isDarkMode?: boolean }) => {
  if (isDarkMode) return null;
  
  return (
    <View className="flex-1">
      {title ? (
        <Text className="text-black text-xl font-JakartaMedium" numberOfLines={1}>
          {title === "Groups" ? "Community" : title}
        </Text>
      ) : (
        <Text className="text-[#FF6B6B] text-2xl font-JakartaExtraBold tracking-wide" numberOfLines={1}>
          ThePulse
        </Text>
      )}
    </View>
  );
});

const SharedHeaderTabs = memo(({ title, whichIcon, showLocation, isDarkMode }: SharedHeaderTabsProps) => {
  const { locationString } = useSession();
  const { query, setQuery } = useSearch();

  const renderIcon = useMemo(() => {
    if (whichIcon === 2) return null;
    
    return (
      <View className="w-12 items-end">
        {whichIcon === 0 && <CollectionsIcon isDarkMode={isDarkMode} />}
        {whichIcon === 1 && <SettingsIcon isDarkMode={isDarkMode} />}
      </View>
    );
  }, [whichIcon, isDarkMode]);

  return (
    <View className="bg-general-300">
      <SafeAreaView edges={["top"]} className={`${isDarkMode ? "bg-black" : "bg-white"}`} style={headerStyles.container}>
        <View>
          <View className="flex-row items-center justify-between px-4 h-14">
            <TitleView title={title} isDarkMode={isDarkMode} />
            {showLocation && <LocationView locationString={locationString} isDarkMode={isDarkMode} />}
            {whichIcon === 2 ? (
              <View className="flex-1 items-end">
                <SearchForm 
                  query={query} 
                  setQuery={setQuery}
                />
              </View>
            ) : renderIcon}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

SharedHeaderTabs.displayName = 'SharedHeaderTabs';

export default SharedHeaderTabs;
