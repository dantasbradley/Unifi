import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton"
const AuthScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      {/*<Image source={require("../assets/logo.png")} style={styles.logo} /> */}

      {/* App Name */}
      <Text style={styles.appName}>UniFi</Text>

      {/* Login Button */}
      <CustomButton title="Login" onPress={() => navigation.navigate("Login")} />

      {/* Sign Up Button */}
      <CustomButton title="Sign Up" onPress={() => navigation.navigate("SignUp")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120, // Adjust to match Figma design
    height: 120, // Adjust to match Figma design
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff", // White text
    marginBottom: 40,
  },
});

export default AuthScreen;
