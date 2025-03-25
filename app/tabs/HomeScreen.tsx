import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // For localStorage in React Native

const HomeScreen = () => {
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        // Get Cognito sub from local storage
        const cognitoSub = localStorage.getItem('cognitoSub')
        if (!cognitoSub) {
          console.error("Cognito sub not found in localStorage.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://3.85.25.255:3000/get-user-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sub: cognitoSub }) // Send sub to backend
        });

        const data = await response.json();
        if (response.ok) {
          setUserName(data.name);
        } else {
          console.error("Error fetching name:", data.message);
        }
      } catch (error) {
        console.error("❌ Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Welcome, {userName || "Guest"}!</Text>
      )}
    </View>
  );
};

export default HomeScreen;