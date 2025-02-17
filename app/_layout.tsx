import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="screens/AuthScreen" options={{ title: "Auth" }} />
      <Stack.Screen name="screens/LoginScreen" options={{ title: "Login" }} />
    </Stack>
  );
}
