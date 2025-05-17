import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import SharedHeaderTabs from "@/components/headers/sharedHeaderTabs";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [title, setTitle] = useState("Home");
  const [whichIcon, setWhichIcon] = useState(0);
  const [showLocation, setShowLocation] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const tabName = pathname.split('/').pop();
    switch (tabName) {
      case "home":
        setTitle("");
        setWhichIcon(0);
        setShowLocation(true);
        break;
      case "notifications":
        setTitle("Notifications");
        setShowLocation(false);
        setWhichIcon(0);
        break;
      case "profile":
        setTitle("Profile");
        setShowLocation(false);
        setWhichIcon(1);
        break;
      case "map":
        setTitle("Map");
        setWhichIcon(0);
        setShowLocation(true);
        break;
    }
  }, [pathname]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <StatusBar style="auto" />
      <View className="flex-1">
        <SharedHeaderTabs title={title} whichIcon={whichIcon} showLocation={showLocation}/>
        <Tabs
          screenOptions={{ 
            tabBarActiveTintColor: "black",
            tabBarStyle: {
              backgroundColor: "#ffffff",
              position: 'absolute',
              height: 75
            }
          }}
          backBehavior="order"
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="home-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: "Notifications",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="map"
            options={{
              title: "Map",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
