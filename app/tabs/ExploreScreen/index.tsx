import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CommunityCard from "../../components/ExploreComponents/CommunityCard";
import CreateCommunityModal from "../../components/ExploreComponents/CreateCommunityModal";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
  const [communities, setCommunities] = useState([]);

  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchCommunities();
    fetchFollowedClubs();
  }, []);

  useEffect(() => {
    const updateFollowedClubs = async () => {
      console.log("Updating followed clubs on the server...");
      const sub = await AsyncStorage.getItem('cognitoSub');
      const clubs = Array.from(joinedCommunities).join(',');
      console.log(`Updating clubs for sub: ${sub} with clubs: ${clubs}`);
      await fetch("http://3.85.25.255:3000/modify-following-clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sub, clubs })
      });
      console.log("Clubs updated successfully.");
    };
  
    updateFollowedClubs();
  }, [joinedCommunities]);
  

  const fetchCommunities = async () => {
    try {
      const response = await fetch("http://3.85.25.255:3000/api/clubs");
      const data = await response.json();
      // Ensure IDs are strings if they're stored as strings in joinedCommunities
      const formattedData = data.map(community => ({
          ...community,
          id: String(community.id) // Convert to string if necessary
      }));
      setCommunities(formattedData);
      console.log("Communities fetched successfully:", formattedData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
};


  const fetchFollowedClubs = async () => {
    try {
        const sub = await AsyncStorage.getItem('cognitoSub');
        const response = await fetch("http://3.85.25.255:3000/get-clubs-following", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sub })
        });
        const data = await response.json();
        let clubsList = data.clubs === "No Clubs" ? [] : data.clubs.split(',').map(club => club.trim());
        const uniqueClubs = new Set(clubsList); // Assuming IDs are strings
        setJoinedCommunities(uniqueClubs);
        console.log("Followed clubs retrieved and deduplicated:", Array.from(uniqueClubs));
    } catch (error) {
        console.error("Error fetching followed clubs:", error);
    }
};




const toggleJoinCommunity = (id) => {
  setJoinedCommunities(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
      console.log(`User has left the community with ID: ${id}`);
    } else {
      newSet.add(id);
      console.log(`User has joined the community with ID: ${id}`);
    }
    return newSet;
  });
};


  const addCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityLocation.trim()) {
      Alert.alert("Error", "Community name and location cannot be empty");
      return;
    }
    try {
      console.log("Adding new community...");
      const response = await fetch("http://3.85.25.255:3000/api/add-club", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCommunityName, location: newCommunityLocation }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
      setCommunities([...communities, { id: result.id, name: newCommunityName, location: newCommunityLocation }]);
      toggleJoinCommunity(result.id.toString());
      console.log("New community added successfully:", result);
      setNewCommunityName("");
      setNewCommunityLocation("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding community:", error);
      Alert.alert("Error", error.message || "Error adding community. Please try again.");
    }
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
        data={communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={joinedCommunities.has(item.id)}
            onToggleJoin={() => toggleJoinCommunity(item.id)}
            onPress={() => router.push({
              pathname: "/tabs/ExploreScreen/CommunityDetails",
              params: { id: item.id, name: item.name },
            })}
          />
        )}
      />
      <CreateCommunityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        newCommunityName={newCommunityName}
        onChangeName={setNewCommunityName}
        newCommunityLocation={newCommunityLocation}
        onChangeLocation={setNewCommunityLocation}
        onCreate={addCommunity}
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
