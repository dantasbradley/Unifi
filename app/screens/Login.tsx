import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { useRouter } from "expo-router";
import Toast, { ToastShowParams } from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const storeCognitoSub = async (cognitoSub : string) => {
    try {
      await AsyncStorage.setItem("cognitoSub", cognitoSub);
      console.log('cognitoSub stored successfully');
    } catch (error) {
      console.error('Failed to store cognitoSub', error);
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter your email and password.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://3.85.25.255:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        if (response.status === 401) {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: result.error || "Invalid email or password.",
            visibilityTime: 4000,
            position: "top",
            text1Style: { fontSize: 22, fontWeight: "bold" },
            text2Style: { fontSize: 18 },
          });
          return;
        }
        throw new Error("Something went wrong.");
      }

      await storeCognitoSub(result.cognitoSub);  

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Logged in successfully!",
        visibilityTime: 3000,
        position: "top",
        text1Style: { fontSize: 24, fontWeight: "bold" },
        text2Style: { fontSize: 20 },
      });

      // Navigate after showing toast
      setTimeout(() => {
        router.push("/tabs/HomeScreen");
      }, 1000);

    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error instanceof Error ? error.message : "An unexpected error occurred.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/screens/resetEmail")}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <Toast config={toastConfig} />
    </View>
  );
};

const toastConfig = {
  success: (props: ToastShowParams) => (
    <View style={[styles.toastContainer, { backgroundColor: "green" }]}>
      <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{props.text1}</Text>
      <Text style={[styles.toastText, { fontSize: 20 }]}>{props.text2}</Text>
    </View>
  ),
  error: (props: ToastShowParams) => (
    <View style={[styles.toastContainer, { backgroundColor: "red" }]}>
      <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{props.text1}</Text>
      <Text style={[styles.toastText, { fontSize: 20 }]}>{props.text2}</Text>
    </View>
  ),
  info: (props: ToastShowParams) => (
    <View style={[styles.toastContainer, { backgroundColor: "blue" }]}>
      <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{props.text1}</Text>
      <Text style={[styles.toastText, { fontSize: 20 }]}>{props.text2}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    backgroundColor: "#222",
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
  toastContainer: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default Login;