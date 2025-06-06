import { Tabs } from "expo-router";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import Sidebar from "../components/Sidebar";
import { useHamburger } from "../components/Hamburger";

//local image assets for tab icons
const homeIcon = require("../../assets/images/home.png");
const exploreIcon = require("../../assets/images/compass.png");
const calendarIcon = require("../../assets/images/calendar.png");
const profileIcon = require("../../assets/images/profile.png");
const extraIcon = require("../../assets/images/profile.png"); 
const menuIcon = require("../../assets/images/hamburger.png");
const fallbackIcon = require("../../assets/images/profile.png"); 

export default function TabLayout() {
  const { toggleSidebar } = useHamburger(); //hook to toggle the sidebar menu

  return (
    <View style={styles.container}>
      <Sidebar /> //renders the sliding sidebar

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true, //show top header
          headerTitle: "", //leave title empty
          headerStyle: {
            backgroundColor: "#DAD7CD",
            borderBottomWidth: 1,
            borderBottomColor: "#A3B18A",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          },
          headerTitleStyle: { color: "white" },

          tabBarStyle: {
            backgroundColor: "#DAD7CD", //tab bar background
            height: 95,
            paddingBottom: 15,
            borderTopWidth: 1,
            borderTopColor: "#A3B18A",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 4,
          },
          tabBarItemStyle: {
            height: 95,
          },
          tabBarShowLabel: false, //hide label text

          tabBarIcon: ({ focused }) => {
            
            //icon logic based on route name
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
                    tintColor: focused ? "#2A3C2A" : "#5F7756", //dark green if active
                  }}
                />
              </View>
            );
          },

          headerLeft: () => (
            //hamburger icon in top-left to toggle sidebar
            <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
              <Image source={menuIcon} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          ),
        })}
      >
        {/* screens inside the tab layout */}
        <Tabs.Screen name="HomeScreen" />
        <Tabs.Screen name="ExploreScreen" />
        <Tabs.Screen name="CalendarScreen" />
        <Tabs.Screen name="ExtraScreen" />
        <Tabs.Screen name="ProfileScreen" />
      </Tabs>
    </View>
  );
}

//basic styles used in the layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", //entire app background
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hamburger: {
    marginLeft: 15, //spacing for hamburger button
  },
});