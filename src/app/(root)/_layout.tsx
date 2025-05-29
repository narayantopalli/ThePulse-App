import { RevenueCatProvider } from "@/providers/RevenueCat";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    // <RevenueCatProvider>
      <Stack screenOptions={{ animation: "fade", freezeOnBlur: true }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(edit)" options={{ headerShown: false }} />
        <Stack.Screen name="(social)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="crop-photo" options={{ headerShown: false }} />
      </Stack>
    // </RevenueCatProvider>
  );
};

export default Layout;
