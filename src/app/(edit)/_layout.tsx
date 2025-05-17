import SharedHeaderOptions from "@/components/headers/sharedHeaderOptions";
import { router, Stack, useLocalSearchParams, usePathname } from "expo-router";
import { useState } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Layout = () => {
  const pathname = usePathname();
  const [goBackPath, setGoBackPath] = useState("");

  useEffect(() => {
    const path = pathname.split('/').pop();

    switch (path) {
      case "update-status":
        setGoBackPath("/camera");
        break;
      case "create-post":
        setGoBackPath("/(root)/(tabs)/home");
        break;
      case "public-profile":
        setGoBackPath("");
        break;
      case "bio-edit":
        setGoBackPath("/(root)/(tabs)/profile");
        break;
      default:
        setGoBackPath("/(root)/settings");
        break;
    }
  }, [pathname]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-general-900">
      <View className="flex-1">
        <SharedHeaderOptions goBackPath={goBackPath} />
        <Stack>
          <Stack.Screen name="birthday-edit" options={{ headerShown: false }} />
          <Stack.Screen name="bio-edit" options={{ headerShown: false }} />
          <Stack.Screen name="gender-edit" options={{ headerShown: false }} />
          <Stack.Screen name="name-edit" options={{ headerShown: false }} />
          <Stack.Screen name="password-edit" options={{ headerShown: false }} />
          <Stack.Screen name="update-status" options={{ headerShown: false }} />
          <Stack.Screen name="public-profile" options={{ headerShown: false }} />
          <Stack.Screen name="create-post" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaView>
  );
};

export default Layout;
