import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
import SharedHeaderTabs from "@/components/headers/sharedHeaderTabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { withLayoutContext, usePathname } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { useSession } from "@/contexts/SessionContext";

const {Navigator, Screen} = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function RootLayout() {
  const { isAnonymous, notifications } = useSession();
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
      case "groups":
        setTitle("Groups");
        setWhichIcon(2);
        setShowLocation(false);
        break;
    }
  }, [pathname]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />
      <View className="flex-1 ">
        <SharedHeaderTabs title={title} whichIcon={whichIcon} showLocation={showLocation}/>
        <View className="flex-1">
          <Tabs
            screenOptions={{ 
              tabBarActiveTintColor: "#000000",
              tabBarInactiveTintColor: "#666666",
              tabBarStyle: {
                backgroundColor: "#ffffff",
                elevation: 4,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                height: 85,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderTopWidth: 1,
                borderTopColor: "#e5e5e5"
              },
              tabBarIndicatorStyle: {
                backgroundColor: 'transparent'
              },
              tabBarShowLabel: false,
              tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                <View style={{
                  backgroundColor: focused ? '#000000' : 'transparent',
                  borderRadius: 25,
                  padding: 8
                }}>
                  <MaterialCommunityIcons
                    name={focused ? "home" : "home-outline"}
                    size={32}
                    color={focused ? '#ffffff' : '#000000'}
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
                    backgroundColor: focused ? '#000000' : 'transparent',
                    borderRadius: 25,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "home" : "home-outline"}
                      size={32}
                      color={focused ? '#ffffff' : '#000000'}
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
                  <View style={{ position: 'relative' }}>
                    <View style={{
                      backgroundColor: focused ? '#000000' : 'transparent',
                      borderRadius: 25,
                      padding: 8
                    }}>
                      <MaterialCommunityIcons
                        name={focused ? "bell" : "bell-outline"}
                        size={32}
                        color={focused ? '#ffffff' : '#000000'}
                      />
                    </View>
                    {notifications?.length > 0 && (
                      <View style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        backgroundColor: '#FF3B30',
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#ffffff'
                      }}>
                        <Text style={{
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {notifications.length > 99 ? '99+' : notifications.length}
                        </Text>
                      </View>
                    )}
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
                    backgroundColor: focused ? '#000000' : 'transparent',
                    borderRadius: 25,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "map-marker" : "map-marker-outline"}
                      size={32}
                      color={focused ? '#ffffff' : '#000000'}
                    />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="groups"
              options={{
                title: "Groups",
                headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                  <View style={{
                    backgroundColor: focused ? '#000000' : 'transparent',
                    borderRadius: 25,
                    padding: 8
                  }}>
                    <MaterialCommunityIcons
                      name={focused ? "account-group" : "account-group-outline"}
                      size={32}
                      color={focused ? '#ffffff' : '#000000'}
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
                    backgroundColor: focused ? '#000000' : 'transparent',
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
    </View>
  );
}
