import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton"
import { navigate } from "expo-router/build/global-state/routing";

const LoginScreen = ( {navigate} : any ) => {
    return (
        <View style = {styles.container}>
            <Text style={styles.appName}>Login</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000", // Black background
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#fff", // White text
      marginBottom: 40,
    },
  });

export default LoginScreen