import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const Login = ({ navigation }: any) => {
  // State variables for storing user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.form}>
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

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => alert("Button was clicked")}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  loginButton: {
    backgroundColor: "#222", // Button color
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#000",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default Login;