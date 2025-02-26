import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useHamburger } from "./Hamburger"; 
import { Ionicons } from "@expo/vector-icons";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useHamburger();
  const translateX = new Animated.Value(isSidebarOpen ? 0 : -300);

  Animated.timing(translateX, {
    toValue: isSidebarOpen ? 0 : -300,
    duration: 300,
    useNativeDriver: true,
  }).start();

  return (
    <>
      {isSidebarOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeSidebar} />
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>My Organizations</Text>

        {/* Figma Organizations. Need to update to pull from backend */}
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Alachua County Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Gainesville Ministry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>SCORE North Florida</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 280,
    height: "100%",
    backgroundColor: "black",
    padding: 20,
    zIndex: 2,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  menuText: {
    color: "white",
    fontSize: 16,
  },
});

export default Sidebar;
