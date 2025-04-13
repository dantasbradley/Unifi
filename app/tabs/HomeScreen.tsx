import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  // Sample data; replace later with data from communities
  const [posts, setPosts] = useState([
    {
      id: "1",
      user: "Coding Club",
      time: "10h",
      content: "Today, we have yet another day of coding...",
      likes: 824,
      comments: 0,
    },
    {
      id: "2",
      user: "Baking Society",
      time: "2d",
      content: "Today we are learning how to bake a tie-dye pizza for the local elementary school.",
      likes: 592,
      comments: 0,
    },
    {
      id: "3",
      user: "Art Enthusiasts",
      time: "3d",
      content: "Everyone can use a little art to brighten their day. Come join us as we teach seniors the basics of pottery at the local nursing home!",
      likes: 0,
      comments: 0,
    },
  ]);

  // Function to "like" a post
  const handleLike = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        {/* Header: user name and time */}
        <View style={styles.postHeader}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Actions row (like, comment, share) */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons name="heart-outline" size={20} color="#000000" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#000000" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={20} color="#000000" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#40798C",
    padding: 10,
  },
  postContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  userName: {
    color: "#000000",
    fontWeight: "bold",
  },
  postTime: {
    color: "#999",
  },
  postContent: {
    color: "#000000",
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
    color: "#000000",
    marginLeft: 5,
  },
});
