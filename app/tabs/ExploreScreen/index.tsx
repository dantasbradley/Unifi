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
  const [adminCommunities, setAdminCommunities] = useState(new Set<string>());
  const [communities, setCommunities] = useState([]);

  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCommunities();
    fetchUserAttribute("custom:clubs_following").then((clubs) => {
      if (clubs) {
        console.log("Clubs:", clubs);
        let clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
        const uniqueClubs = new Set(clubsList); // Assuming IDs are strings
        setJoinedCommunities(uniqueClubs);
        console.log("Followed clubs retrieved and deduplicated:", Array.from(uniqueClubs));
      }
    });
    fetchAdminClubs();
  }, []);

  useEffect(() => {
    const clubs = Array.from(joinedCommunities).join(',');
    updateUserAttribute("custom:clubs_following", clubs); 

  }, [joinedCommunities]);

  const fetchAdminClubs = async () => {
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      // Replace with your backend endpoint for checking admin status
      const response = await fetch(`http://3.85.25.255:3000/DB/club_admins/get/admin_id=${cognitoSub}`);
      const data = await response.json();

      console.log("Admin clubs fetched successfully:", data);
  
      // Check if the user is an admin for any clubs
      if (data && Array.isArray(data)) {
        const adminClubIds = data.map(item => String(item.club_id)); // Extracting club_id and converting to string
        setAdminCommunities(new Set(adminClubIds)); // Store as a set to avoid duplicates
        console.log(`User is admin for clubs:`, adminClubIds);
      } else {
        console.log("User is not an admin for any clubs.");
        setAdminCommunities(new Set()); // No admin clubs
      }
    } catch (error) {
      console.error("Error fetching admin clubs:", error);
    }
  };
  
  // Function to fetch a user attribute from Cognito
  const fetchUserAttribute = async (attributeName : any) => {
      const cognitoSub = await AsyncStorage.getItem('cognitoSub');
      try {
          const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);    
          const data = await response.json();

          if (!response.ok) throw new Error(data.message);
          console.log(`${attributeName} fetched successfully:`, data[attributeName]);
          return data[attributeName];
  
      } catch (error) {
          console.error("Network error while fetching attribute:", error);
          return null;
      }
  };
    
  // Function to update a user attribute in Cognito
  const updateUserAttribute = async (attributeName : any, value : any) => {
      const cognitoSub = await AsyncStorage.getItem('cognitoSub');
      try {
          const response = await fetch(`http://3.85.25.255:3000/cognito/update/attribute`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ sub: cognitoSub, attributeName, value }),
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data.message);
          console.log(`${attributeName} updated successfully.`);
          return true;

      } catch (error) {
          console.error("Network error while updating attribute:", error);
          return false;
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

  const fetchCommunities = async () => {
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
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

  const addCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityLocation.trim()) {
      Alert.alert("Error", "Community name and location cannot be empty");
      return;
    }
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      console.log("Adding new community...");
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCommunityName, location: newCommunityLocation, admin_id: cognitoSub }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
      setAdminCommunities(new Set(adminCommunities).add(result.id.toString()));
      setCommunities([...communities, { id: result.id, name: newCommunityName, location: newCommunityLocation, membersCount: 0 }]);
      setNewCommunityName("");
      setNewCommunityLocation("");
      setModalVisible(false);
      // console.log("New community added successfully:", result);
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
            isAdmin={adminCommunities.has(item.id.toString())}
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
