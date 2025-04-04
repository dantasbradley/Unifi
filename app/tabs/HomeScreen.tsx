import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import { CommunitiesContext } from "../contexts/CommunitiesContext";

const HomeScreen = () => {
  const {
    joinedCommunities = new Set(),
    fetchPostsForClub = () => {},
  } = useContext(CommunitiesContext) || {};

  const [posts, setPosts] = useState([]);
  // const [joinedCommunities, setJoinedCommunities] = useState(new Set());
  

  useEffect(() => {
    setPosts([]);
    fetchJoinedCommunitiesPosts();
  }, [joinedCommunities]);

  const fetchJoinedCommunitiesPosts = async () => {
    console.log("Joined clubs:", Array.from(joinedCommunities));
    joinedCommunities.forEach(handleFetchPostsForClub);
  };

  // const getJoinedCommunities = async () => {
  //   console.log("Fetching joined communities...");
  //   await fetchCommunities();
  //   const clubs = await fetchUserAttribute("custom:clubs_following");
  //   if (clubs) {
  //     const clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
  //     const uniqueClubs = new Set(clubsList);
  //     setJoinedCommunities(uniqueClubs);
  //     console.log("Joined clubs:", Array.from(uniqueClubs));
  //     uniqueClubs.forEach(fetchPostsForClub);
  //   }
  // };

  // const fetchCommunities = async () => {
  //   try {
  //     const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
  //     if (!response.ok) throw new Error("Failed to fetch communities");
  //     const data = await response.json();
  //     // console.log("Communities fetched:", data);
  //   } catch (error) {
  //     console.error("Error fetching clubs:", error);
  //     Alert.alert("Error", "Failed to fetch community data.");
  //   }
  // };

  // const fetchUserAttribute = async (attributeName) => {
  //   try {
  //     const cognitoSub = await AsyncStorage.getItem('cognitoSub');
  //     const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);
  //     if (!response.ok) throw new Error("Failed to fetch user attributes");
  //     const data = await response.json();
  //     console.log("User attribute fetched:", attributeName, data[attributeName]);
  //     return data[attributeName];
  //   } catch (error) {
  //     console.error("Network error while fetching attribute:", error);
  //     return null;
  //   }
  // };

  const handleFetchPostsForClub = async (clubId : any) => {
    const data = await fetchPostsForClub(clubId);
    console.log("Fetched posts: ", data);
  
    // Use Set to filter out duplicates by post id (assuming 'id' is unique for each post)
    setPosts((prevPosts) => {
      const uniquePosts = new Set(prevPosts.map(post => post.id)); // Set of existing post ids
      const newPosts = data.filter(post => !uniquePosts.has(post.id)); // Filter out duplicates
      return [...prevPosts, ...newPosts]; // Concatenate new posts with the existing ones
    });
  };

  const handleLike = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.title}>{item.title} - {item.clubName}</Text> {/* Display club name with title */}
        <Text style={styles.postTime}>{item.time}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              This page shows the events and posts of your following communities.
            </Text>
            <Text style={styles.emptyText}>Go to the explore page to follow some communities.</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  postContainer: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
  },
  postTime: {
    color: "#999",
  },
  postContent: {
    color: "#fff",
    marginBottom: 10,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});
