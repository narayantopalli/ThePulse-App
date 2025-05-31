import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname } from "expo-router";

const Layout = () => {
  const pathname = usePathname();

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 ${pathname === "/vibe" ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-1">
        <Stack>
          <Stack.Screen name="public-profile" options={{ headerShown: false }} />
          <Stack.Screen name="create-post" options={{ headerShown: false }} />
          <Stack.Screen name="update-status" options={{ headerShown: false }} />
          <Stack.Screen name="my-posts" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaView>
  );
};

export default Layout;
