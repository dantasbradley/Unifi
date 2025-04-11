import React, { useRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton"
import { Link } from "expo-router";
import { usePushNotitifcations } from "../components/usePushNotifications";

const AuthScreen = ({ navigation }: any) => {

  const {expoPushToken, notification} = usePushNotitifcations();

  const data = JSON.stringify(notification, undefined, 2);

  return (
    <View style={styles.container}>
      {/* Logo */}
      {/*<Image source={require("../assets/logo.png")} style={styles.logo} /> */}
      <Text>Token: {expoPushToken?.data ?? ""}</Text>
      <Text>data</Text>

      {/* App Name */}
      <Text style={styles.appName}>UniFi</Text>

      {/* Login Button */}
      <View testID="login">
      <Link href={"/screens/Login"} asChild>
        <CustomButton title="Login" onPress={() => null} />
      </Link>
      </View>


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
