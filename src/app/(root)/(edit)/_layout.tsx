import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="birthday-edit" options={{ headerShown: false }} />
      <Stack.Screen name="bio-edit" options={{ headerShown: false }} />
      <Stack.Screen name="pronouns-edit" options={{ headerShown: false }} />
      <Stack.Screen name="name-edit" options={{ headerShown: false }} />
      <Stack.Screen name="password-edit" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
