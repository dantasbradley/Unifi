import { Link } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const SignUp = ({ navigation }: any ) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [passwordConf, setPasswordConf] = useState("");
    
    return (
        <View style={styles.container}>
            <View style={styles.form}>
                {/* First Name Input */}
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. John"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    value={firstName}
                    onChangeText={setFirstName}
                />

                {/* Last Name Input */}
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Smith"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    value={lastName}
                    onChangeText={setLastName}
                />

                {/* Email Input */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#aaa"
                    secureTextEntry // Hides text input (for passwords)
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Password Input */}
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#aaa"
                    secureTextEntry // Hides text input (for passwords)
                    value={passwordConf}
                    onChangeText={setPasswordConf}
                />

                {/* Continue Button */}
                <Link href={"/screens/ProfileSetup"} asChild>
                    <TouchableOpacity style={styles.continueButton}>
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </Link>
                
            </View>
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
    form: {
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 10,
      width: "80%",
    },
    label: {
      fontSize: 16,
      color: "#000",
      marginBottom: 5,
    },
    input: {
      height: 40,
      borderColor: "#ddd",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 15,
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
  });

export default SignUp;