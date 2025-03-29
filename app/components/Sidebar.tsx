import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
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
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Organizations</Text>

          <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
            <View style={styles.closeHitbox}>
              <Ionicons name="close" size={28} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Orgs */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Alachua County Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Gainesville Ministry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>SCORE North Florida</Text>
          </TouchableOpacity>

          {/* tests for scrolling */}
          {Array.from({ length: 20 }).map((_, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <Text style={styles.menuText}>Extra Org {i + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    bottom: 60, 
    width: 280,
    backgroundColor: "black",
    zIndex: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 70,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    marginRight: 0,
  },
  closeHitbox: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
