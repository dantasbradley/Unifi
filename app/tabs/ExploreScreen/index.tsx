import React, { useState, useEffect, useContext } from "react";
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CommunityCard from "../../components/ExploreComponents/CommunityCard";
import CreateCommunityModal from "../../components/ExploreComponents/CreateCommunityModal";
import { CommunitiesContext } from "../../contexts/CommunitiesContext";

export default function ExploreScreen() {
  const router = useRouter();
  const {
    communities = [],
    joinedCommunities = new Set(),
    adminCommunities = new Set(),
    addCommunity = () => {},
    toggleJoinCommunity = () => {},
    fetchCommunities = () => {},
  } = useContext(CommunitiesContext) || {};

  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search communities..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        key={refreshKey}
        data={communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={joinedCommunities.has(item.id)}
            isAdmin={adminCommunities.has(item.id.toString())}
            onToggleJoin={() => toggleJoinCommunity(item.id)}
            onPress={() => router.push({
              pathname: "/tabs/ExploreScreen/CommunityDetails",
              params: { id: item.id, name: item.name, isAdmin: adminCommunities.has(item.id.toString()) },
            })}
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
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 15,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

// export default ExploreScreen;
