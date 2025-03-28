import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Post {
  id: string;
  name: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.postName}>{post.name}</Text>
        <Text style={styles.postTime}>{post.time}</Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  postName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  postTime: {
    color: "#999",
    fontSize: 14,
  },
  postContent: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 14,
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
    fontSize: 14,
  },
});

export default PostCard;
