import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunitiesContext } from "../contexts/CommunitiesContext";
import PostCard, { Post } from "../components/ExploreComponents/PostCard";

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

  const fetchUserId = async () => {
    const userId = await AsyncStorage.getItem('cognitoSub');
    return userId;
  }

  const fetchJoinedCommunitiesPosts = async () => {
  console.log("Fetching posts for joined communities");
  joinedCommunities.forEach(async (clubId) => {
    console.log(`Fetching posts for club: ${clubId}`);
    await handleFetchPostsForClub(clubId);
  });
};

const handleFetchPostsForClub = async (clubId) => {
  console.log(`Fetching user ID for likes`);
  const userId = await fetchUserId();
  if (!userId) {
    console.error('User ID is not set');
    Alert.alert('Error', 'User not logged in.');
    return;
  }
  console.log(`Fetching posts data for club ID: ${clubId}`);
  const postsData = await fetchPostsForClub(clubId);
  console.log(`Posts data received: ${JSON.stringify(postsData)}`);

  const postsWithLikes = await Promise.all(postsData.map(async (post) => {
    console.log(`Fetching like count for post ID: ${post.id}`);
    const likesResponse = await fetch(`http://3.85.25.255:3000/likes/count/${post.id}`);
    const likesData = await likesResponse.json();
    console.log(`Likes data for post ID ${post.id}: ${JSON.stringify(likesData)}`);

    console.log(`Checking if user ${userId} liked post ID ${post.id}`);
    const userLikesResponse = await fetch(`http://3.85.25.255:3000/likes/user_likes?post_id=${post.id}&user_id=${userId}`);
    const userLikesData = await userLikesResponse.json();
    console.log(`User likes data for post ID ${post.id}: ${JSON.stringify(userLikesData)}`);

    return {
      ...post,
      likes: likesData.likesCount,
      isLikedByUser: userLikesData.isLikedByUser,
    };
  }));

  console.log(`Updating posts state with new data`);
  setPosts((prevPosts) => {
    const updatedPosts = [...prevPosts, ...postsWithLikes];
  
    // Step 4: Sort by original timestamp descending (newest first)
    const sortedPosts = updatedPosts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
    console.log(`🔄 Sorted posts (newest first): ${JSON.stringify(sortedPosts)}`);
    return sortedPosts;
  });
  
};


const handleLike = async (post) => {
  console.log(`Handling like for post ID: ${post.id}`);
  const userId = await AsyncStorage.getItem('cognitoSub');
  if (!userId) {
    console.log("User ID not found in storage");
    Alert.alert("Error", "User ID not found. Please log in again.");
    return;
  }

  const url = post.isLikedByUser ? 'http://3.85.25.255:3000/likes/remove' : 'http://3.85.25.255:3000/likes/add';
  const method = post.isLikedByUser ? 'DELETE' : 'POST';
  console.log(`URL: ${url} Method: ${method} UserID: ${userId} PostID: ${post.id}`);

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_id: post.id, user_id: userId })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Failed to toggle like. Response: ${errorData}`);
      throw new Error(`Failed to toggle like: ${errorData}`);
    }

    console.log(`Like toggle successful for post ID: ${post.id}`);
    setPosts((currentPosts) => {
      const updatedPosts = currentPosts.map((p) => {
        if (p.id === post.id) {
          return {
            ...p,
            likes: post.isLikedByUser ? p.likes - 1 : p.likes + 1,
            isLikedByUser: !post.isLikedByUser,
          };
        }
        return p;
      });
      console.log(`Posts after toggle: ${JSON.stringify(updatedPosts)}`);
      return updatedPosts;
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    Alert.alert("Error", error.message);
  }
};


const renderPost = ({ item }) => <PostCard post={item} onLike={handleLike} />;
;
  

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