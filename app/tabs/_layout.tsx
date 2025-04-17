// import { Tabs, useSegments } from "expo-router";
// import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
// import Sidebar from "../components/Sidebar";
// import { useHamburger } from "../components/Hamburger";
// import { CommunitiesProvider } from "../contexts/CommunitiesContext";

// const homeIcon = require("../../assets/images/home.png");
// const exploreIcon = require("../../assets/images/compass.png");
// const calendarIcon = require("../../assets/images/calendar.png");
// const profileIcon = require("../../assets/images/profile.png");
// const notificationIcon = require("../../assets/images/bell.png");
// const menuIcon = require("../../assets/images/hamburger.png");
// const fallbackIcon = require("../../assets/images/profile.png");

// export default function TabLayout() {
//   const { toggleSidebar } = useHamburger();
//   const segments = useSegments();
//   const isHomeScreen = segments[segments.length - 1] === "HomeScreen";

//   return (
//     <CommunitiesProvider>
//       <View style={styles.container}>
//         {/* 👇 Only render Sidebar on HomeScreen */}
//         {isHomeScreen && <Sidebar />}

//         <Tabs
//           screenOptions={({ route }) => ({
//             headerShown: true,
//             headerTitle: "",
//             headerStyle: { backgroundColor: "black" },
//             headerTitleStyle: { color: "white" },
//             tabBarStyle: {
//               backgroundColor: "black",
//               height: 88,
//               paddingBottom: 12,
//               borderTopWidth: 0,
//             },
//             tabBarItemStyle: { height: 88 },
//             tabBarShowLabel: false,
//             tabBarIcon: ({ focused }) => {
//               const icons = {
//                 HomeScreen: homeIcon,
//                 ExploreScreen: exploreIcon,
//                 CalendarScreen: calendarIcon,
//                 ProfileScreen: profileIcon,
//                 NotificationScreen: notificationIcon,
//               };
//               const iconSource = icons[route.name] || fallbackIcon;
//               return (
//                 <View style={styles.iconContainer}>
//                   <Image
//                     source={iconSource}
//                     style={{
//                       width: 30,
//                       height: 30,
//                       tintColor: focused ? "white" : "gray",
//                     }}
//                   />
//                 </View>
//               );
//             },
//             headerLeft: () => (
//               <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
//                 <Image source={menuIcon} style={{ width: 24, height: 24 }} />
//               </TouchableOpacity>
//             ),
//           })}
//         >
//           <Tabs.Screen name="HomeScreen" />
//           <Tabs.Screen name="ExploreScreen" />
//           <Tabs.Screen name="CalendarScreen" />
//           <Tabs.Screen name="ProfileScreen" />
//           <Tabs.Screen name="NotificationScreen" />
//           <Tabs.Screen name="ProfileSetup" options={{ href: null }} />
//         </Tabs>
//       </View>
//     </CommunitiesProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "black",
//   },
//   iconContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   hamburger: {
//     marginLeft: 15,
//   },
// });

import { Tabs, useSegments } from "expo-router";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import Sidebar from "../components/Sidebar";
import { useHamburger } from "../components/Hamburger";
import { CommunitiesProvider } from "../contexts/CommunitiesContext";

// Icons
const homeIcon = require("../../assets/images/home.png");
const exploreIcon = require("../../assets/images/compass.png");
const calendarIcon = require("../../assets/images/calendar.png");
const profileIcon = require("../../assets/images/profile.png");
const notificationIcon = require("../../assets/images/bell.png");
const menuIcon = require("../../assets/images/hamburger.png");
const fallbackIcon = require("../../assets/images/profile.png");

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
            headerStyle: { backgroundColor: "black" },
            headerTitleStyle: { color: "white" },

            tabBarStyle: {
              backgroundColor: "black",
              height: 88,
              paddingBottom: 12,
              borderTopWidth: 0,
            },
            tabBarItemStyle: {
              height: 88,
            },
            tabBarShowLabel: false,

            tabBarIcon: ({ focused }) => {
              const icons: Record<string, any> = {
                HomeScreen: homeIcon,
                ExploreScreen: exploreIcon,
                CalendarScreen: calendarIcon,
                ProfileScreen: profileIcon,
                NotificationScreen: notificationIcon,
              };

              const iconSource = icons[route.name] || fallbackIcon;

              return (
                <View style={styles.iconContainer}>
                  <Image
                    source={iconSource}
                    style={{
                      width: 30,
                      height: 30,
                      tintColor: focused ? "white" : "gray",
                    }}
                  />
                </View>
              );
            },

            // Only show hamburger icon on HomeScreen
            headerLeft: () =>
              route.name === "HomeScreen" ? (
                <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
                  <Image source={menuIcon} style={{ width: 24, height: 24}} />
                </TouchableOpacity>
              ) : null,
          })}
        >
          <Tabs.Screen name="HomeScreen" />
          <Tabs.Screen name="ExploreScreen" />
          <Tabs.Screen name="CalendarScreen" />
          <Tabs.Screen name="ProfileScreen" />
          <Tabs.Screen name="NotificationScreen" />

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
