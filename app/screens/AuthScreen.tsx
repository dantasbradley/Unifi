import React, { useRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton"
import { Link } from "expo-router";
const AuthScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      {/*<Image source={require("../assets/logo.png")} style={styles.logo} /> */}

      {/* App Name */}
      <Text style={styles.appName}>UniFi</Text>

      {/* Login Button */}
      <Link href={"/screens/Login"} asChild>
        <CustomButton title="Login" onPress={() => null}/>
      </Link>


      {/* Sign Up Button */}
      <Link href={"/screens/SignUp"} asChild>
        <CustomButton title="Sign Up" onPress={() => null} />
      </Link>
      
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
  linkText: {
    fontSize: 24,
    color: "#fff",
    textDecorationLine: "underline",
  }
});

export default AuthScreen;
