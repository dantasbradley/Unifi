import React, { useState } from "react";
import { Link } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import CheckButton from "../components/CheckButton"

const ProfileSetup = ({ navigation }: any ) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                {/* This will probably need to be replaced later */}
                <CheckButton text="Example Button"></CheckButton>
                <CheckButton text="Animal Wellfare"></CheckButton>
                <CheckButton text="Art"></CheckButton>
                <CheckButton text="Education"></CheckButton>
                <CheckButton text="Environment"></CheckButton>
                <CheckButton text="Food"></CheckButton>
                <CheckButton text="Humanitarian Aid"></CheckButton>
                <CheckButton text="Health"></CheckButton>
                <CheckButton text="Mentorship"></CheckButton>
                <CheckButton text="Tech"></CheckButton>
            </View>

            {/* Continue Button */}
            <Link href={"/screens/ProfileSetup"} asChild>
                <TouchableOpacity style={styles.continueButton}>
                    <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        paddingTop: 15,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignContent: "flex-start",
        rowGap: 10,
        columnGap: 10,
        flexWrap: "wrap"
    },
    continueButton: {
        backgroundColor: "#222",
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 15,
    },
    continueText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
})
export default ProfileSetup;