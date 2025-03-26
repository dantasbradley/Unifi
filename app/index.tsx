import { useEffect } from "react";
import { useRouter, Link } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import {NavigationContainer} from '@react-navigation/native';

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
