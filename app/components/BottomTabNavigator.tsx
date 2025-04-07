import { Tabs } from "expo-router";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import Sidebar from "../components/Sidebar";
import { useHamburger } from "../components/Hamburger";

const homeIcon = require("../../assets/images/home.png");
const exploreIcon = require("../../assets/images/compass.png");
const calendarIcon = require("../../assets/images/calendar.png");
const profileIcon = require("../../assets/images/profile.png");
const extraIcon = require("../../assets/images/profile.png"); 
const menuIcon = require("../../assets/images/hamburger.png");
const fallbackIcon = require("../../assets/images/profile.png"); 

export default function TabLayout() {
  const { toggleSidebar } = useHamburger();

  return (
    <View style={styles.container}>
      <Sidebar />

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#40798C" },
          headerTitleStyle: { color: "white" },

          tabBarStyle: {
            backgroundColor: "black",
            height: 95,
            paddingBottom: 15,
            borderTopWidth: 0,
          },
          tabBarItemStyle: {
            height: 95,
          },
          tabBarShowLabel: false,

          tabBarIcon: ({ focused }) => {
            const icons: Record<string, any> = {
              HomeScreen: homeIcon,
              ExploreScreen: exploreIcon,
              CalendarScreen: calendarIcon,
              ProfileScreen: profileIcon,
              ExtraScreen: extraIcon,
            };

            const iconSource = icons[route.name] || fallbackIcon;

            return (
              <View style={styles.iconContainer}>
                <Image
                  source={iconSource}
                  style={{
                    width: 34,
                    height: 34,
                    tintColor: focused ? "white" : "gray",
                  }}
                />
              </View>
            );
          },

          headerLeft: () => (
            <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
              <Image source={menuIcon} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          ),
        })}
      >
        <Tabs.Screen name="HomeScreen" />
        <Tabs.Screen name="ExploreScreen" />
        <Tabs.Screen name="CalendarScreen" />
        <Tabs.Screen name="ProfileScreen" />
        <Tabs.Screen name="ExtraScreen" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#40798C",
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
