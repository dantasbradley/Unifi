import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from 'date-fns';

export interface Post {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  content: string;
  likes: number;
  comments: number;
  clubName: string;
  clubImageUrl: string;
  postImageUrl: string;
}

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  onToggleLike: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isLiked, onToggleLike, onDelete, onEdit }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {post.clubImageUrl ? (
          <Image source={{ uri: post.clubImageUrl }} style={styles.clubImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View>
          <Text style={styles.clubName}>{post.clubName}</Text>
          <Text style={styles.createdAt}>Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</Text>
          {post.updated_at && (
            <Text style={styles.createdAt}>Updated {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}</Text>
          )}
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      {post.postImageUrl && (
          <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />
      )}
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onToggleLike}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#FF4C4C" : "#ccc"} />
          <Text style={styles.iconText}>{post.likes}</Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color="#ccc" />
            <Text style={styles.iconText}>Edit</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#588157",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#DAD7CD",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  clubImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },

  postImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#1C1C1C",
  },

  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#3A3A3A",
  },

  clubName: {
    color: "#F0F0F0",
    fontWeight: "600",
    fontSize: 16,
  },

  createdAt: {
    color: "#C0C0C0",
    fontSize: 13,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  content: {
    color: "#EAEAEA",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#4C6A52",
    paddingTop: 10,
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  iconText: {
    color: "#DDDDDD",
    marginLeft: 6,
    fontSize: 14,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E74C3C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: "auto",
  },

  deleteText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
});;

export default PostCard;
