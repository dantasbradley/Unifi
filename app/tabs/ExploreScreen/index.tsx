import React, { useState, useEffect } from "react"; 
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CommunityCard, { Community } from "../../components/ExploreComponents/CommunityCard";
import CreateCommunityModal from "../../components/ExploreComponents/CreateCommunityModal";
import CustomButton from '../components/CustomButton';



// const dummyCommunities: Community[] = [
//   {
//     id: "1",
//     name: "Alachua County Library District",
//     description: "We are a group that loves to read, meet up, and share ideas!",
//     membersCount: "5.0k",
//     location: "Gainesville, FL",
//   }
// ];

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
  // const [communities, setCommunities] = useState<Community[]>(dummyCommunities);
  const [communities, setCommunities] = useState([]);

  // Modal state for creating new community
  const [newCommunityName, setNewCommunityName] = useState("");
  // const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Fetch clubs from the database
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://3.85.25.255:3000/api/clubs");
        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }
        const data = await response.json();
        console.log("Fetched clubs:", data);
        setCommunities(data || []);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };
    fetchClubs();
  }, []);


  // const addCommunity = () => {
  //   const newId = (communities.length + 1).toString();
  //   const newCommunity: Community = {
  //     id: newId,
  //     name: newCommunityName || `New Community ${newId}`,
  //     description: "We are a new group looking for more members!",
  //     membersCount: "0",
  //     location: newCommunityLocation.trim() || "Unknown",
  //   };

  const addCommunity = async () => {
    if (!newCommunityName.trim()) {
      alert("Community name cannot be empty");
      return;
    }
    if (!newCommunityLocation.trim()) {
      alert("Community location cannot be empty");
      return;
    }
  
    try {
      console.log("newCommunityName: ", newCommunityName);
      console.log("newCommunityLocation: ", newCommunityLocation);
      const response = await fetch("http://3.85.25.255:3000/api/add-club", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: newCommunityName, 
          location: newCommunityLocation 
        }),
      });

      // if (!response.ok) {
      //   throw new Error("Failed to add community");
      // }
  
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
  
      // setCommunities([...communities, { id: result.club_id, name: newCommunityName }]);
      setCommunities([...communities, { 
        id: result.id, 
        name: newCommunityName, 
        location: newCommunityLocation,
        membersCount: "0",
      }]);
      setNewCommunityName("");
      setNewCommunityLocation("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding community:", error);
      alert(error.message || "Error adding community. Please try again.");
    }
  };

  const goToCommunityDetails = (community: Community) => {
    router.push({
      pathname: "/tabs/ExploreScreen/CommunityDetails",
      params: {
        id: community.id,
        name: community.name,
      },
    });
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
        data={communities.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={joinedCommunities.has(item.id)}
            onToggleJoin={() => toggleJoinCommunity(item.id)}
            onPress={() => goToCommunityDetails(item)}
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
