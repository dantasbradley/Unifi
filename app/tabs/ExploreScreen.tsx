import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

const dummyCommunities = [
  { id: '1', name: 'Coding Club' },
  { id: '2', name: 'Baking Society' },
  { id: '3', name: 'Art Enthusiasts' },
  { id: '4', name: 'Book Readers' },
  { id: '5', name: 'Entrepreneurs Network' },
];

const placeholderImage = require('../../assets/images/placeholder.png');

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
  const [communities, setCommunities] = useState(dummyCommunities);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities(prevState => {
      const newSet = new Set(prevState);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addCommunity = () => {
    const newId = (communities.length + 1).toString();
    const newCommunity = { id: newId, name: newCommunityName || `New Community ${newId}` };
    setCommunities([...communities, newCommunity]);
    setNewCommunityName('');
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
        data={communities.filter(community =>
          community.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.communityItem}>
            <Image source={placeholderImage} style={styles.communityImage} />
            <Text style={styles.communityText}>{item.name}</Text>
            <CustomButton
              title={joinedCommunities.has(item.id) ? 'Joined' : 'Join'}
              onPress={() => toggleJoinCommunity(item.id)}
            />
          </View>
        )}
      />

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            <Text style={styles.modalText}>Community Name:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter community name"
              placeholderTextColor="#aaa"
              value={newCommunityName}
              onChangeText={setNewCommunityName}
            />
            <CustomButton title="Create" onPress={addCommunity} />
            <CustomButton title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
};

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
  communityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  communityImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  communityText: {
    flex: 1,
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#fff",
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#000",
  },
});

export default ExploreScreen;
