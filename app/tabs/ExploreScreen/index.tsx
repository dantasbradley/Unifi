import React, { useState } from "react"; 
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CommunityCard, { Community } from "../../components/ExploreComponents/CommunityCard";
import CreateCommunityModal from "../../components/ExploreComponents/CreateCommunityModal";

const dummyCommunities: Community[] = [
  {
    id: "1",
    name: "Alachua County Library District",
    description: "We are a group that loves to read, meet up, and share ideas!",
    membersCount: "5.0k",
    location: "Gainesville, FL",
  },
  {
    id: "2",
    name: "Coding Club",
    description: "We tutor and create coding solutions for underprivileged communities.",
    membersCount: "2.3k",
    location: "Online",
  },
  {
    id: "3",
    name: "Baking Society",
    description: "Insert description",
    membersCount: "900",
    location: "Ocala, Florida",
  },
  {
    id: "4",
    name: "Art Enthusiasts",
    description: "Insert description",
    membersCount: "1.2k",
    location: "Sarasota, Florida",
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
  const [communities, setCommunities] = useState<Community[]>(dummyCommunities);

  // Modal state for creating new community
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityLocation, setNewCommunityLocation] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const addCommunity = () => {
    const newId = (communities.length + 1).toString();
    const newCommunity: Community = {
      id: newId,
      name: newCommunityName || `New Community ${newId}`,
      description: "We are a new group looking for more members!",
      membersCount: "0",
      location: newCommunityLocation.trim() || "Unknown",
    };

    setCommunities([...communities, newCommunity]);
    setNewCommunityName("");
    setNewCommunityLocation("");
    setModalVisible(false);
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
