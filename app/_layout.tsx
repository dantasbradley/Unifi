import { Stack } from "expo-router";
import { HamburgerProvider } from "./components/Hamburger"; 
import { NotificationProvider } from "./notifications/notificationcontext";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler( {
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export default function Layout() {
  return (
    <NotificationProvider>
      <HamburgerProvider> 
        <Stack>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="screens/AuthScreen" options={{ title: "Auth" }} />
          <Stack.Screen name="screens/Login" options={{ title: "Login" }} />
          <Stack.Screen name="screens/SignUp" options={{ title: "Sign Up" }} />
          <Stack.Screen name="screens/Verification" options={{ title: "Verification" }} />


          <Stack.Screen name="tabs" options={{ headerShown: false }} />
        </Stack>
      </HamburgerProvider>
    </NotificationProvider>
  );
}