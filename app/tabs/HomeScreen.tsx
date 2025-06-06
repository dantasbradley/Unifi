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

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Function to refresh the community posts
  const handleRefresh = async () => {
    console.log("Refreshing home screen");
    setRefreshing(true);
    try {
      setPosts([]);
      await fetchJoinedCommunitiesPosts(); 
      setRefreshKey(Date.now());
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
    const communityIds = Array.from(joinedCommunities);
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
    const sortedPosts = uniquePosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
              This page shows the posts of your following communities
            </Text>
            <Text style={styles.emptyText}>Go to the explore page to follow some communities</Text>
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
    backgroundColor: "#DAD7CD",
    padding: 10,
  },
  postContainer: {
    backgroundColor: "#A3B18A",
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
    color: "#344E41",
    fontWeight: "bold",
  },
  postTime: {
    color: "#588157",
  },
  postContent: {
    color: "#344E41",
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
    color: "#344E41",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#344E41",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});