import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Post {
  id: string;
  title: string;
  time: string; // original timestamp, used for sorting
  timeFormatted: string; // user-friendly string
  content: string;
  likes: number;
  comments: number;
  clubName: string;
  clubImageUrl: string;
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
    <View style={styles.postContainer}>
      {post.clubImageUrl ? (
          <Image source={{ uri: post.clubImageUrl }} style={styles.communityImage} />
      ) : (
          <Text>...</Text>
      )}
      <Text style={styles.postTitle}>{post.clubName}</Text>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postTime}>{post.timeFormatted}</Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onToggleLike}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "white" : "#fff"} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
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
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  postTitle: {
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
  deleteButton: {
    backgroundColor: "red",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  }  ,
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  }  
});

export default PostCard;
