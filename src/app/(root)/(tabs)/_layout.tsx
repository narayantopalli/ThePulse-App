import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import SharedHeaderTabs from "@/components/headers/sharedHeaderTabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { withLayoutContext, usePathname } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { useSession } from "@/contexts/SessionContext";

const {Navigator, Screen} = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function RootLayout() {
  const { isAnonymous } = useSession();
  const [title, setTitle] = useState("Home");
  const [whichIcon, setWhichIcon] = useState(0);
  const [showLocation, setShowLocation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const tabName = pathname.split('/').pop();
    switch (tabName) {
      case "home":
        setTitle("");
        setWhichIcon(0);
        setShowLocation(true);
        setIsDarkMode(false);
        break;
      case "notifications":
        setTitle("Notifications");
        setShowLocation(false);
        setWhichIcon(0);
        setIsDarkMode(false);
        break;
      case "profile":
        setTitle("Profile");
        setShowLocation(false);
        setWhichIcon(1);
        setIsDarkMode(false);
        break;
      case "map":
        setTitle("Map");
        setWhichIcon(0);
        setShowLocation(true);
        setIsDarkMode(false);
        break;
      case "community":
        setTitle("Community");
        setWhichIcon(2);
        setShowLocation(true);
        setIsDarkMode(true);
        break;
    }
  }, [pathname]);

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <StatusBar style={isDarkMode ? "light" : "auto"} />
      <View className="flex-1">
        <SharedHeaderTabs title={title} whichIcon={whichIcon} showLocation={showLocation} isDarkMode={isDarkMode}/>
        <View className="flex-1">
          <Tabs
            screenOptions={{ 
              tabBarActiveTintColor: isDarkMode ? "#ffffff" : "#000000",
              tabBarInactiveTintColor: isDarkMode ? "#666666" : "#666666",
              tabBarStyle: {
                backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                elevation: 0,
                shadowOpacity: 0,
                height: 85,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? "#333333" : "#e5e5e5"
              },
              tabBarIndicatorStyle: {
                backgroundColor: 'transparent'
              },
              tabBarShowLabel: false,
              tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                <View style={{
                  backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                  borderRadius: 20,
                  padding: 8
                }}>
                  <MaterialCommunityIcons
                    name={focused ? "home" : "home-outline"}
                    size={32}
                    color={focused ? (isDarkMode ? '#000000' : '#ffffff') : (isDarkMode ? '#ffffff' : '#000000')}
                  />
                </View>
              ),
              swipeEnabled: true,
              animationEnabled: true
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                    borderRadius: 20,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "home" : "home-outline"}
                      size={32}
                      color={focused ? (isDarkMode ? '#000000' : '#ffffff') : (isDarkMode ? '#ffffff' : '#000000')}
                    />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="notifications"
              options={{
                title: "Notifications",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                    borderRadius: 20,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "bell" : "bell-outline"}
                      size={32}
                      color={focused ? (isDarkMode ? '#000000' : '#ffffff') : (isDarkMode ? '#ffffff' : '#000000')}
                    />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="map"
              options={{
                title: "Map",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                    borderRadius: 20,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "map-marker" : "map-marker-outline"}
                      size={32}
                      color={focused ? (isDarkMode ? '#000000' : '#ffffff') : (isDarkMode ? '#ffffff' : '#000000')}
                    />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="community"
              options={{
                title: "Community",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                    borderRadius: 20,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "account-group" : "account-group-outline"}
                      size={32}
                      color={focused ? (isDarkMode ? '#000000' : '#ffffff') : (isDarkMode ? '#ffffff' : '#000000')}
                    />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent',
                    padding: 2,
                    borderRadius: 25
                  }}>
                    <SmallProfilePhoto isAnonymous={isAnonymous} />
                  </View>
                ),
              }}
            />
          </Tabs>
        </View>
      </View>
    </SafeAreaView>
  );
}
