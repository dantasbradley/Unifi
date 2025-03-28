import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const placeholderImage = require("../../../assets/images/placeholder.png");

export default function CommunityDetailsScreen() {
  // Grab the query params (e.g., id and name) from the URL
  const { id, name } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <Image source={placeholderImage} style={styles.largeImage} />

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.sectionText}>
        We are a group that...
      </Text>

      <Text style={styles.sectionTitle}>Contact Information</Text>
      <Text style={styles.sectionText}>Email: example@gmail.com</Text>
      <Text style={styles.sectionText}>Insta: @insertHandle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  largeImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionText: {
    color: "#fff",
    marginBottom: 15,
  },
});
