import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import CheckButton from "../components/CheckButton"

const ProfileSetup = ({ navigation }: any ) => {
    return (
        <View style={styles.container}>
            <CheckButton text="Test Button"></CheckButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000", // Main background color
        alignItems: "center",
        justifyContent: "center",
    },
})
export default ProfileSetup;