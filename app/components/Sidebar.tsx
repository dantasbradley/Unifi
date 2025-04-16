import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, StatusBar, ScrollView, Image, FlatList, RefreshControl, Alert } from "react-native";
import { useHamburger } from "./Hamburger";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunitiesContext } from "../contexts/CommunitiesContext";
import { useMemo } from "react";
import CommunityCard from "../components/ExploreComponents/CommunityCard";
import { router } from "expo-router";
import CreateCommunityModal from "./ExploreComponents/CreateCommunityModal";

const Sidebar = () => {

  const {
    communities = [],
    joinedCommunities = new Set(),
    adminCommunities = new Set(),
    addCommunity = () => {},
    toggleJoinCommunity = () => {},
    fetchCommunities = () => {},
  } = useContext(CommunitiesContext) || {};

  const { isSidebarOpen, closeSidebar } = useHamburger();
  const sidebarWidth = 350;
  const translateX = new Animated.Value(isSidebarOpen ? 0 : -sidebarWidth);
  const [filter, setFilter] = useState("admin");

  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Function to refresh the community list
  const handleRefresh = async () => {
    console.log("refreshing page");
    setRefreshing(true);
    try {
      await fetchCommunities(); // Fetch latest data
      setRefreshKey(Date.now()); // 👈 Forces FlatList to refresh
    } catch (error) {
      console.error("Error refreshing communities:", error);
    }
    setRefreshing(false);
  };

  const addNewCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityLocation.trim()) {
      Alert.alert("Error", "Community name and location cannot be empty");
      return;
    }
    addCommunity(newCommunityName, newCommunityLocation);
    setNewCommunityName("");
    setNewCommunityLocation("");
    setModalVisible(false);
  };

  useEffect(() => {
    // Trigger animation when sidebar state changes
    Animated.timing(translateX, {
      toValue: isSidebarOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const displayedClubs = useMemo(() => {
    if (filter === "admin") {
      return communities.filter(community => adminCommunities.has(community.id));
    } else {
      return communities.filter(community => joinedCommunities.has(community.id));
    }
  }, [filter, communities, adminCommunities, joinedCommunities]);

  return (
    <>
      {isSidebarOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeSidebar} />
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>My Organizations</Text>
            <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
              <View style={styles.closeHitbox}>
                <Ionicons name="close" size={28} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setFilter("admin")}
              style={[styles.filterButton, filter === "admin" && styles.activeFilter]}
            >
              <Text style={[styles.filterText, filter === "admin" && styles.activeFilterText]}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter("following")}
              style={[styles.filterButton, filter === "following" && styles.activeFilter]}
            >
              <Text style={[styles.filterText, filter === "following" && styles.activeFilterText]}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Conditionally Render Add Button */}
          {filter === "admin" && (
            <TouchableOpacity
              style={styles.regularAddButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.regularAddButtonText}>+ Add Community</Text>
            </TouchableOpacity>
          )}

          {/* Club List */}
          <FlatList
            key={refreshKey}
            data={displayedClubs}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <CommunityCard
                community={item}
                isJoined={joinedCommunities.has(item.id)}
                isAdmin={adminCommunities.has(item.id.toString())}
                onToggleJoin={() => toggleJoinCommunity(item.id)}
                onPress={() => {
                  closeSidebar();
                  router.push({
                  pathname: "/tabs/ExploreScreen/CommunityDetails",
                  params: { id: item.id, name: item.name, isAdmin: adminCommunities.has(item.id.toString()), startTab: "Bio" },
                }); }}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
          <CreateCommunityModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            newCommunityName={newCommunityName}
            onChangeName={setNewCommunityName}
            newCommunityLocation={newCommunityLocation}
            onChangeLocation={setNewCommunityLocation}
            onCreate={addNewCommunity}
          />
        </View>
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
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 15,
  },
  regularAddButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  regularAddButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },  
  sidebar: {
    position: "absolute",
    left: 0,
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    bottom: 60,
    width: 350,
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
    marginTop: Platform.OS === "android"
      ? (StatusBar.currentHeight || 0) + (70 - (StatusBar.currentHeight || 0))
      : 70,
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
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "black"  // Ensure default background is black
  },
  activeFilter: {
    backgroundColor: "white",
  },
  filterText: {
    color: "white",
    fontSize: 14,
  },
  activeFilterText: {  // New style for active filter text
    color: "black",
  },
  communityName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  secondLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondLineText: {
    color: "#ccc",
    fontSize: 14,
  },
});

export default Sidebar;
