import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast, { ToastShowParams } from "react-native-toast-message";

const Verification = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // Get email from query params

  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!verificationCode || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "All fields are required.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Do Not Match",
        text2: "Please ensure both passwords are identical.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://3.85.25.255:3000/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode: verificationCode.trim(),
          newPassword,
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password.");
      }

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
        text2: "You can now log in with your new password.",
        visibilityTime: 4000,
        position: "top",
        text1Style: { fontSize: 22, fontWeight: "bold" },
        text2Style: { fontSize: 18 },
      });

      // ✅ Redirect to Login page after success
      setTimeout(() => {
        router.push("/screens/Login");
      }, 1000);

    } catch (error) {
      setLoading(false);
      
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

      Toast.show({
        type: "error",
        text1: "Reset Failed",
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
        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the code sent to your email"
          keyboardType="numeric"
          value={verificationCode}
          onChangeText={setVerificationCode}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetText}>Reset Password</Text>}
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
  resetButton: {
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  resetText: {
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

export default Verification;
