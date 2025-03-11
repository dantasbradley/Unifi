import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // ✅ Use useLocalSearchParams
import Toast from "react-native-toast-message";

const Verification = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams(); // ✅ Correct way to retrieve params

    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerification = async () => {
        if (!email) {
            Toast.show({ type: "error", text1: "Error", text2: "Email not found, please sign up again." });
            return;
        }

        if (!verificationCode) {
            Toast.show({ type: "error", text1: "Missing Code", text2: "Please enter your verification code." });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://3.85.25.255:3000/verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, verificationCode }),
            });

            const result = await response.json();
            setLoading(false);

            if (!response.ok) {
                Toast.show({ type: "error", text1: "Verification Failed", text2: result.message });
                return;
            }

            Toast.show({ type: "success", text1: "Verified", text2: "Your account is now verified. Redirecting to login..." });

            setTimeout(() => router.push("/screens/Login"), 1500);
        } catch (error) {
            setLoading(false);
            Toast.show({ type: "error", text1: "Verification Failed", text2: "Network error, please try again." });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Enter Verification Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Verification Code"
                    keyboardType="numeric"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                />

                <TouchableOpacity style={styles.verifyButton} onPress={handleVerification} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Verify</Text>}
                </TouchableOpacity>
            </View>

            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
    form: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    label: { fontSize: 16, color: "#000", marginBottom: 5 },
    input: { height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
    verifyButton: { backgroundColor: "#222", paddingVertical: 12, borderRadius: 5, alignItems: "center", marginBottom: 15 },
    verifyText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default Verification;
