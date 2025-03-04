import { Tabs } from "expo-router";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import Sidebar from "../components/Sidebar";
import { useHamburger } from "../components/Hamburger"; 

// Import local images
const homeIcon = require("../../assets/images/home.png");
const exploreIcon = require("../../assets/images/compass.png");
const calendarIcon = require("../../assets/images/calendar.png");
const profileIcon = require("../../assets/images/profile.png");
const menuIcon = require("../../assets/images/hamburger.png"); 

export default function TabLayout() {
  const { toggleSidebar } = useHamburger(); 

  return (
    <View style={styles.container}>
      <Sidebar />

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true, 
          headerTitle: "",
          headerStyle: { backgroundColor: "black" }, 
          headerTitleStyle: { color: "white" }, // 
          tabBarStyle: { backgroundColor: "black", height: 60 },
          tabBarShowLabel: false,
          tabBarLabelStyle: { display: "none" },
          tabBarIcon: ({ focused }) => {
            let iconSource;
            if (route.name === "HomeScreen") iconSource = homeIcon;
            else if (route.name === "ExploreScreen") iconSource = exploreIcon;
            else if (route.name === "CalendarScreen") iconSource = calendarIcon;
            else if (route.name === "ProfileScreen" || route.name === "NotificationScreen") iconSource = profileIcon;

            return (
              <Image
                source={iconSource}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "white" : "gray",
                }}
              />
            );
          },
          headerLeft: () => ( 
            <TouchableOpacity onPress={toggleSidebar} style={{ marginLeft: 15 }}>
              <Image source={menuIcon} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          ),
        })}
      >
        <Tabs.Screen name="HomeScreen" options={{ tabBarLabel: () => null }} />
        <Tabs.Screen name="ExploreScreen" options={{ tabBarLabel: () => null }} />
        <Tabs.Screen name="CalendarScreen" options={{ tabBarLabel: () => null }} />
        <Tabs.Screen name="ProfileScreen" options={{ tabBarLabel: () => null }} />
        <Tabs.Screen name="NotificationScreen" options={{ tabBarLabel: () => null}} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", 
  },
});
