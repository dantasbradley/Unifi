import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, View } from "react-native";
import HomeScreen from "../tabs/HomeScreen";
import ExploreScreen from "../tabs/ExploreScreen";
import CalendarScreen from "../tabs/CalendarScreen";
import ProfileScreen from "../tabs/ProfileScreen";

const homeIcon = require("../../assets/images/home.png");
const exploreIcon = require("../../assets/images/compass.png");
const calendarIcon = require("../../assets/images/calendar.png");
const profileIcon = require("../../assets/images/profile.png");

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarStyle: { backgroundColor: "black", height: 60 },
        tabBarShowLabel: false, 
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === "Home") iconSource = homeIcon;
          else if (route.name === "Explore") iconSource = exploreIcon;
          else if (route.name === "Calendar") iconSource = calendarIcon;
          else if (route.name === "Profile") iconSource = profileIcon;

          return (
            <View style={{ alignItems: "center" }}>
              <Image
                source={iconSource}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "white" : "gray",
                }}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
