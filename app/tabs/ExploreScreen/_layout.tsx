import { Stack } from "expo-router";

export default function ExploreLayout() {
  // Wraps the screens in this folder with a Stack navigator
  return <Stack screenOptions={{ headerShown: false }} />;
}
