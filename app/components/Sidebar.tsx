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

  //grab values/methods from context
  const {
    communities = [],
    joinedCommunities = new Set(),
    adminCommunities = new Set(),
    addCommunity = () => {},
    toggleJoinCommunity = () => {},
    fetchCommunities = () => {},
  } = useContext(CommunitiesContext) || {};

  const { isSidebarOpen, closeSidebar } = useHamburger(); //open/close state
  const sidebarWidth = 350;
  const translateX = new Animated.Value(isSidebarOpen ? 0 : -sidebarWidth); //slide-in effect
  const [filter, setFilter] = useState("admin"); //filter toggle

  //input state for creating new community
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false); //toggle
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now()); //force re-render

  //refresh communities on pull-down
  const handleRefresh = async () => {
    console.log("Refreshing sidebar page");
    setRefreshing(true);
    try {
      await fetchCommunities();
      setRefreshKey(Date.now());
    } catch (error) {
      console.error("Error refreshing communities:", error);
    }
    setRefreshing(false);
  };

  //add a new community with validation
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

  //slide sidebar in or out based on isSidebarOpen
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isSidebarOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  //memoized filtered community list
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
        <TouchableOpacity style={styles.overlay} onPress={closeSidebar} /> //tap outside to close
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <View style={styles.container}>
          {/* sidebar header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>My Organizations</Text>
            <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
              <View style={styles.closeHitbox}>
                <Ionicons name="close" size={28} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/*filter buttons for admin/following*/}
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

          {/*only admins can add new communities */}
          {filter === "admin" && (
            <TouchableOpacity
              style={styles.regularAddButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.regularAddButtonText}>+ Add Community</Text>
            </TouchableOpacity>
          )}

          {/* scrollable feature for sidebar*/}
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
                    params: {
                      id: item.id,
                      name: item.name,
                      isAdmin: adminCommunities.has(item.id.toString()),
                      startTab: "Bio",
                    },
                  });
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />

          {/* modal for creating community */}
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
