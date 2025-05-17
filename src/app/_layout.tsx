import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { enableFreeze } from 'react-native-screens';
import { SessionProvider } from "@/contexts/SessionContext";
import "../../global.css";

enableFreeze(true);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <Stack screenOptions={{ animation: "fade", freezeOnBlur: true }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        <Stack.Screen name="(edit)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SessionProvider>
  );
}

export default Layout;
