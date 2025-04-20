import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import Toast, { ToastShowParams } from "react-native-toast-message";
import { useRouter } from "expo-router";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Missing Email",
        text2: "Please enter your email address.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://3.85.25.255:3000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      Toast.show({
        type: "success",
        text1: "Verification Sent",
        text2: "Check your email for the verification code.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });

      // Navigate to verification screen after a short delay
      setTimeout(() => {
        router.push(`/screens/resetPassword?email=${encodeURIComponent(email)}`);
      }, 1000);

    } catch (error) {
      setLoading(false);
      
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
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

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Send Verification</Text>}
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
  verifyButton: {
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

export default VerifyEmail;
