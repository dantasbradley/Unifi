import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Image, TouchableOpacity,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomButton from "../../components/CustomButton";

const placeholderImage = require("../../../assets/images/placeholder.png");

const dummyCommunities = [
  {
    id: "1",
    name: "Alachua County Library District",
    description: "We are a group that loves to read, meet up, and share ideas!",
  },
  {
    id: "2",
    name: "Coding Club",
    description: "We tutor and create coding solutions for underprivileged communities.",
  },
  { id: "3", 
    name: "Baking Society",
    description: "Insert description",
  },
  { id: "4", 
    name: "Art Enthusiasts",
    description: "Insert description",
  }
];

export default function ExploreScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
  const [communities, setCommunities] = useState(dummyCommunities);

  // For the modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");

  // Toggle "join" status
  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Add a new community
  const addCommunity = () => {
    const newId = (communities.length + 1).toString();
    const newCommunity = {
      id: newId,
      name: newCommunityName || `New Community ${newId}`,
      description:
        newCommunityDescription.trim() ||
        "We are a group that loves to meet up and share ideas...",
    };

    setCommunities([...communities, newCommunity]);
    setNewCommunityName("");
    setNewCommunityDescription("");
    setModalVisible(false);
  };

  // Navigate to the details screen
  const goToCommunityDetails = (community: { id: string; name: string }) => {
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
      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search communities..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Community list */}
      <FlatList
        data={communities.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            {/* Clickable area for details */}
            <TouchableOpacity
              style={styles.infoContainer}
              activeOpacity={0.8}
              onPress={() => goToCommunityDetails(item)}
            >
              <Image source={placeholderImage} style={styles.communityImage} />
              <View style={styles.textContainer}>
                <Text style={styles.communityName}>{item.name}</Text>
                <Text style={styles.communityDesc}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Join/Joined button */}
            <CustomButton
              title={joinedCommunities.has(item.id) ? "Joined" : "Join"}
              onPress={() => toggleJoinCommunity(item.id)}
            />
          </View>
        )}
      />

      {/* Modal for creating new community */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Community</Text>

            {/* Community Name Field */}
            <Text style={styles.modalText}>Name:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter community name"
              placeholderTextColor="#aaa"
              value={newCommunityName}
              onChangeText={setNewCommunityName}
            />

            {/* Community Description Field */}
            <Text style={styles.modalText}>Description:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter community description"
              placeholderTextColor="#aaa"
              value={newCommunityDescription}
              onChangeText={setNewCommunityDescription}
            />

            {/* Row for Create & Cancel buttons */}
            <View style={styles.modalButtonRow}>
              <CustomButton
                title="Create"
                onPress={addCommunity}
              />
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      )}

      {/* Button to open "create community" modal */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
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
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  communityName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  communityDesc: {
    color: "#ccc",
    fontSize: 14,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  modalOverlay: {
    // Ensures overlay fully covers the screen
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#fff",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  modalInput: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#000",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    width: "45%",
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
