import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "./JoinButton"; 

const placeholderImage = require("../../../assets/images/placeholder.png");

export interface Community {
  id: string;
  name: string;
  description: string;
  membersCount: string;
  location: string;
}

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  isAdmin: boolean;
  onToggleJoin: () => void;
  onPress: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  isJoined,
  onToggleJoin,
  onPress,
  isAdmin,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    fetchImage(`club_profile_pics/${community.id}_${community.name}`, `user_profile_pics/default`);
  }, []);

  const fetchImage = async (filePath : any, defaultPath : any) => {
    try {
        // console.log("filePath: ", filePath);
        const response = await fetch(`http://3.85.25.255:3000/S3/get/image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`);
        const data = await response.json();
        // console.log("Signed URL: ", data.url);
        setImageUrl(data.url);
    } catch (error) {
        console.error('Failed to fetch image:', error);
    }
  };
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.infoContainer} onPress={onPress} activeOpacity={0.8}>
        {/* <Image source={placeholderImage} style={styles.communityImage} /> */}
        {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.communityImage} />
        ) : (
            <Text>Loading image...</Text>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.communityName}>{community.name}</Text>
          <View style={styles.secondLine}>
            <Ionicons name="people" size={14} color="#ccc" style={{ marginRight: 4 }} />
            <Text style={styles.secondLineText}>{community.membersCount}</Text>
            <Ionicons name="location" size={14} color="#ccc" style={{ marginLeft: 16, marginRight: 4 }} />
            <Text style={styles.secondLineText}>{community.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* {isAdmin && <Text style={styles.adminBadge}>Admin</Text>} Show Admin label */}
      {/* <CustomButton title={isJoined ? "Joined" : "Join"} onPress={onToggleJoin} /> */}
      {isAdmin ? (
        <Text style={styles.adminBadge}>Admin</Text>
      ) : (
        <CustomButton title={isJoined ? "Joined" : "Join"} onPress={onToggleJoin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  adminBadge: {
    backgroundColor: "#FFD700",  // Gold color
    color: "#000",
    padding: 5,
    borderRadius: 5,
    fontWeight: "bold",
    marginTop: 5,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  communityName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  secondLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondLineText: {
    color: "#ccc",
    fontSize: 14,
  },
});

export default CommunityCard;
