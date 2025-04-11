import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunitiesContext } from "../contexts/CommunitiesContext";
import PostCard, { Post } from "../components/ExploreComponents/PostCard";

const HomeScreen = () => {
  const {
    likedPosts = new Set(),
    toggleLikePost = () => {},
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

  useEffect(() => {
    fetchJoinedCommunitiesPosts();
  }, [likedPosts]);

  const fetchJoinedCommunitiesPosts = async () => {
    console.log("Fetching posts for joined communities");
    const communityIds = Array.from(joinedCommunities);
    // Fetch posts for all clubs in parallel
    const allPostsArrays = await Promise.all(
      communityIds.map(async (clubId: string) => {
        console.log(`Fetching posts for club: ${clubId}`);
        return fetchPostsForClub(clubId);
      })
    );

    // Flatten the array of arrays
    const allPosts = allPostsArrays.flat();
    // Deduplicate based on post.id
    const uniquePostsMap = new Map();
    allPosts.forEach((post) => {
      if (!uniquePostsMap.has(post.id)) {
        uniquePostsMap.set(post.id, post);
      }
    });
    const uniquePosts = Array.from(uniquePostsMap.values());
    // Sort newest first
    const sortedPosts = uniquePosts.sort((a, b) => new Date(b.time) - new Date(a.time));

    console.log(`✅ Final sorted, deduped posts: ${JSON.stringify(sortedPosts)}`);
    setPosts(sortedPosts);
  };
  

  return (
    <View style={styles.container}>
      <FlatList
        key={refreshKey}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isLiked={likedPosts.has(item.id)}
            onToggleLike={() => toggleLikePost(item.id)}
          />
        )}
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