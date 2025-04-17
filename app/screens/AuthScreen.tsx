import React, { useRef } from "react";
import { View, Text, ImageBackground, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton"
import { Link } from "expo-router";
const AuthScreen = ({ navigation }: any) => {
  return (
    <ImageBackground
      source={require("../../assets/images/leaves-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Logo */}
      {/*<Image source={require("../assets/logo.png")} style={styles.logo} /> */}

      {/* App Name */}
      <Text style={styles.appName}>UniFi</Text>
      <Text style={styles.subtitle}>Connect. Collaborate. Belong.</Text>

      {/* Login Button */}
      <Link href={"/screens/Login"} asChild>
        <CustomButton title="Login" onPress={() => null} />
      </Link>

      {/* Sign Up Button */}
      <Link href={"/screens/SignUp"} asChild>
        <CustomButton title="Sign Up" onPress={() => null} />
      </Link>
      
        </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#588157",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(52, 74, 52, 0.39)", // subtle green overlay
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 40,
    paddingBottom: 60,
    gap: 16,
    width: "100%",
    height: "100%",
  },
  logo: {
    width: 120, // Adjust to match Figma design
    height: 120, // Adjust to match Figma design
    marginBottom: 20,
  },
  appName: {
    fontSize: 40,
    fontWeight: "600",
    color: "#fff", // White text
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    marginBottom: 30,
  },
  linkText: {
    fontSize: 24,
    color: "#fff",
    textDecorationLine: "underline",
  }
});

export default AuthScreen;
