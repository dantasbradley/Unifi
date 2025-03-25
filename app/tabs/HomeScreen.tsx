import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Use hooks from expo-router

const HomeScreen = () => {
  const [name, setName] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(true);
  const { cognitoId } = useLocalSearchParams(); // Ensure this is inside a component or hook

  useEffect(() => {
    const fetchName = async () => {
      if (cognitoId) {
        try {
          const response = await fetch(`http://3.85.25.255:3000/get_name?cognitoId=${cognitoId}`);
          const data = await response.json();
          if (response.ok) {
            setName({ firstName: data.firstName, lastName: data.lastName });
          } else {
            throw new Error(data.message || "Unable to fetch name");
          }
        } catch (error) {
          console.error("Error fetching name:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchName();
  }, [cognitoId]); // Dependency array, re-run effect if cognitoId changes

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Text>Welcome {name.firstName} {name.lastName}!</Text>
      )}
    </View>
  );
};

export default HomeScreen;
