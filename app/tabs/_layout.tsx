import { Tabs, useSegments } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Sidebar from "../components/Sidebar";
import { useHamburger } from "../components/Hamburger";
import { CommunitiesProvider } from "../contexts/CommunitiesContext";

export default function TabLayout() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useHamburger();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];
  const isHomeScreen = currentScreen === "HomeScreen";

  // Close sidebar if navigating away from HomeScreen
  if (!isHomeScreen && isSidebarOpen) {
    closeSidebar();
  }

  return (
    <CommunitiesProvider>
      <View style={styles.container}>
        {isHomeScreen && <Sidebar />}

        <Tabs
          screenOptions={({ route }) => ({
            headerShown: true,
            headerTitle: "",
            headerStyle: {
              backgroundColor: "#DAD7CD",
              borderBottomWidth: 0.75,
              borderBottomColor: "#344E41",
              elevation: 4,
            },
            headerTitleStyle: { color: "#588157" },

            tabBarStyle: {
              backgroundColor: "#DAD7CD",
              height: 88,
              paddingBottom: 12,
              borderTopWidth: 0.75,
              borderTopColor: "#344E41",
              elevation: 4,
            },
            tabBarItemStyle: {
              height: 88,
            },
            tabBarShowLabel: false,

            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name={
                  route.name === "HomeScreen" ? "home" :
                  route.name === "ExploreScreen" ? "compass" :
                  route.name === "CalendarScreen" ? "calendar" :
                  route.name === "ProfileScreen" ? "user" :
                  route.name === "NotificationScreen" ? "bell" :
                  "question"
                }
                size={28}
                color={focused ? "#555" : "#AAA"}
              />
            ),

            // Only show hamburger icon on HomeScreen
            headerLeft: () =>
              route.name === "HomeScreen" ? (
                <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
                  <FontAwesome name="bars" size={28} color="#555" />
                </TouchableOpacity>
              ) : null,
          })}
        >
          <Tabs.Screen name="HomeScreen" />
          <Tabs.Screen name="ExploreScreen" />
          <Tabs.Screen name="CalendarScreen" />
          <Tabs.Screen name="NotificationScreen" />
          <Tabs.Screen name="ProfileScreen" />

          {/* Hidden from tab bar */}
          <Tabs.Screen
            name="ProfileSetup"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </CommunitiesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hamburger: {
    marginLeft: 15,
  },
});
