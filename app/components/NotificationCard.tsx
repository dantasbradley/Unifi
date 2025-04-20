import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  created_at: string;
  updated_at: string;
  type: string;
  title: string;
  clubName: string;
  clubImageUrl: string;
}

interface NotificationCardProps {
  item: Notification;
  onPress: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ item, onPress }) => {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Event Created":
        return { color: "#2ecc71" }; // Green
      case "Event Updated":
        return { color: "#3498db" }; // Blue
      case "Event Deleted":
        return { color: "#e74c3c" }; // Red
      default:
        return { color: "#ECF0F1" }; // Default color
    }
  };  

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        {item.clubImageUrl ? (
          <Image source={{ uri: item.clubImageUrl }} style={styles.clubImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}

        <View style={styles.meta}>
          <Text style={styles.clubName}>{item.clubName}</Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.footer}>
          <Text style={[styles.typeTag, getTypeStyle(item.type)]}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#588157",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#6D9B6A",
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

  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#3A3A3A",
  },

  meta: {
    flexDirection: "column",
  },

  clubName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },

  timestamp: {
    color: "#C2C2C2",
    fontSize: 13,
  },

  body: {
    paddingLeft: 60,
  },

  title: {
    color: "#F1F1F1",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  typeTag: {
    color: "#FFFFFF",
    backgroundColor: "#2F2F2F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "500",
    overflow: "hidden",
  },
});

export default NotificationCard;