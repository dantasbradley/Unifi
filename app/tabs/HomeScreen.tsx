import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native";
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

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  // Function to refresh the community posts
  const handleRefresh = async () => {
    console.log("refreshing home screen");
    setRefreshing(true);
    try {
      setPosts([]);
      await fetchJoinedCommunitiesPosts(); 
      setRefreshKey(Date.now()); // 👈 Forces FlatList to refresh
    } catch (error) {
      console.error("Error refreshing communities:", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    setPosts([]);
    fetchJoinedCommunitiesPosts();
  }, [joinedCommunities]);

  const fetchJoinedCommunitiesPosts = async () => {
    console.log("Joined clubs:", Array.from(joinedCommunities));
    joinedCommunities.forEach(handleFetchPostsForClub);
  };

  const fetchUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  }

  const handleFetchPostsForClub = async (clubId) => {
    const userId = await fetchUserId();
    if (!userId) {
      console.error('User ID is not set');
      Alert.alert('Error', 'User not logged in.');
      return;
    }
    const postsData = await fetchPostsForClub(clubId); // fetch posts
  
    const postsWithLikesPromises = postsData.map(async (post) => {
      const likesResponse = await fetch(`http://3.85.25.255:3000/likes/count/${post.id}`);
      const likesData = await likesResponse.json();
  
      const userLikesResponse = await fetch(`http://3.85.25.255:3000/likes/user_likes?post_id=${post.id}&user_id=${userId}`);
      const userLikesData = await userLikesResponse.json();
  
      return {
        ...post,
        likes: likesData.likesCount,
        isLikedByUser: userLikesData.isLikedByUser,
      };
    });
  
    const postsWithLikes = await Promise.all(postsWithLikesPromises);
  
    setPosts((prevPosts) => {
      const uniquePosts = new Set(prevPosts.map(post => post.id)); // existing post ids
      const newPosts = postsWithLikes.filter(post => !uniquePosts.has(post.id));
      return [...prevPosts, ...newPosts];
    });
  };
  

  const handleLike = async (post) => {
    const userId = await AsyncStorage.getItem('userId'); // Assumed stored upon login
    const url = post.isLikedByUser ? 'http://3.85.25.255:3000/likes/remove' : 'http://3.85.25.255:3000/likes/add';
    const method = post.isLikedByUser ? 'DELETE' : 'POST';
  
    try {
      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ post_id: post.id, user_id: userId })
      });
  
      if (!response.ok) throw new Error('Failed to toggle like');
  
      // Optimistically update the UI
      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likes: post.isLikedByUser ? p.likes - 1 : p.likes + 1,
                isLikedByUser: !post.isLikedByUser,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to toggle like. Please try again.");
    }
  };
  

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.postTime}>{item.time}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item)}>
          <Ionicons name={item.isLikedByUser ? "heart" : "heart-outline"} size={20} color={item.isLikedByUser ? "red" : "#fff"} />
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
        key={refreshKey}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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