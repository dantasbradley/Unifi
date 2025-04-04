import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const CommunityItem = ({ community, onPress }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchImage(`club_profile_pics/${community.id}_${community.name}`, `user_profile_pics/default`);
  }, []);

  const fetchImage = async (filePath : any, defaultPath : any) => {
    try {
      const response = await fetch(
        `http://3.85.25.255:3000/S3/get/image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`
      );
      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error("Failed to fetch image:", error);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.infoContainer} onPress={onPress} activeOpacity={0.8}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.communityImage} />
        ) : (
          <Text>...</Text>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.communityName}>{community.name}</Text>
        </View>
      </TouchableOpacity>
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
    flexWrap: "wrap",
    flexShrink: 1,
  },
});

export default CommunityItem;
