import { useEffect } from "react";
import { useRouter, Link } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import {NavigationContainer} from '@react-navigation/native';

if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];

    // Filter out the VirtualizedLists warning
    if (
      typeof errorMessage === "string" &&
      errorMessage.includes("VirtualizedLists should never be nested inside plain ScrollViews")
    ) {
      return; // Silently ignore this warning
    }

    // Everything else logs normally
    originalConsoleError(...args);
  };
}

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Use a short timeout to ensure Expo Router has mounted
    const timeout = setTimeout(() => {
      router.replace("/screens/AuthScreen");
    }, 100); // Delay of 100ms to allow Expo Router to initialize

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
