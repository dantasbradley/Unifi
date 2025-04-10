import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CommunitiesContext } from "../contexts/CommunitiesContext";

interface Notification {
  id: number;
  title: string;
  type: string;
  time: number;
  clubName: string;
  imageUrl: string;
  club_id: number;
}

interface NotificationCardProps {
  item: Notification;
  onPress: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ item, onPress }) => {
  const {
    fetchClubAttribute = () => {},
  } = useContext(CommunitiesContext) || {};

  const [clubName, setClubName] = useState("");

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
  };

  useEffect(() => {
    fetchClubAttribute(item.club_id, "name").then((name) => {
      if (name) {
        setClubName(name);
      }
    });
  }, [item.club_id]);

  return (
    <TouchableOpacity style={styles.notification} onPress={onPress}>
    {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.communityImage} />
    ) : (
        <Text>...</Text>
    )}
      <View style={styles.leftCol}>
        <Text style={styles.org}>{truncateText(item.clubName, 43)}</Text>
        <Text style={styles.body}>{truncateText(item.title, 120)}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.toc}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notification: {
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#222",
    flexDirection: "row",
    marginVertical: 8,
    height: 90,
    padding: 10,
    marginHorizontal: 15,
    elevation: 5, // Shadow effect for Android
    shadowColor: "#000", // Shadow effect for iOS
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 10,
  },
  leftCol: {
    flex: 4,
    flexDirection: "column",
    justifyContent: "space-between",
    marginRight: 10,
  },
  rightCol: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  org: {
    fontWeight: "bold",
    color: "#ECF0F1",
    fontSize: 16,
    marginBottom: 4,
  },
  body: {
    color: "#BDC3C7",
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20, // Improved line spacing for readability
  },
  type: {
    color: "#ECF0F1",
    fontSize: 14,
    fontWeight: "600",
  },
  toc: {
    color: "#7F8C8D",
    fontSize: 12,
    marginTop: 4,
  },
});

export default NotificationCard;