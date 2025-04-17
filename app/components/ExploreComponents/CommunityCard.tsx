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
  imageUrl: string;
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

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.infoContainer} onPress={onPress} activeOpacity={0.8}>
        {/* <Image source={placeholderImage} style={styles.communityImage} /> */}
        {community.imageUrl ? (
            <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
        ) : (
            <Image source={placeholderImage} style={styles.communityImage} />
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
      {isAdmin === false && (
        <CustomButton title={isJoined ? "Joined" : "Join"} onPress={onToggleJoin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#344E41",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
