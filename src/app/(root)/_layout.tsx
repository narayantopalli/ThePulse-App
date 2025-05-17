import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ animation: "fade", freezeOnBlur: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="my-posts" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
