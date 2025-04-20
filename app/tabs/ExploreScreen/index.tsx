import React, { useState, useEffect, useContext } from "react";
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import CommunityCard from "../../components/ExploreComponents/CommunityCard";
import { CommunitiesContext } from "../../contexts/CommunitiesContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


export default function ExploreScreen() {
  const router = useRouter();
  const {
    communities = [],
    joinedCommunities = new Set(),
    adminCommunities = new Set(),
    toggleJoinCommunity = () => {},
    fetchCommunities = () => {},
  } = useContext(CommunitiesContext) || {};

  const [searchQuery, setSearchQuery] = useState("");
  
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Function to refresh the community list
  const handleRefresh = async () => {
    console.log("Refreshing index explore page");
    setRefreshing(true);
    try {
      await fetchCommunities();
      setRefreshKey(Date.now());
    } catch (error) {
      console.error("Error refreshing communities:", error);
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [])
  );

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
        data={communities
          .filter(c => !adminCommunities.has(c.id.toString()))
          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}        
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={joinedCommunities.has(item.id)}
            isAdmin={adminCommunities.has(item.id.toString())}
            onToggleJoin={() => toggleJoinCommunity(item.id)}
            onPress={() => router.push({
              pathname: "/tabs/ExploreScreen/CommunityDetails",
              params: { id: item.id, name: item.name, isAdmin: adminCommunities.has(item.id.toString()), startTab: "Bio" },
            })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
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
});

// export default ExploreScreen;
