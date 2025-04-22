import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";

const Verification = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const showToast = (type: "success" | "error" | "info", text1: string, text2: string) => {
        Toast.show({
            type,
            text1,
            text2,
            visibilityTime: 4000,
            position: "top",
            text1Style: { fontSize: 24, fontWeight: "bold" },
            text2Style: { fontSize: 20 },
        });
    };

    const handleVerification = async () => {
        if (!email) {
            showToast("error", "Error", "Email not found, please sign up again.");
            return;
        }

        if (!verificationCode) {
            showToast("error", "Missing Code", "Please enter your verification code.");
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
                showToast("error", "Verification Failed", result.message);
                return;
            }

            showToast("success", "Verified", "Your account is now verified. Redirecting to login...");
            setTimeout(() => router.push("/screens/Login"), 1500);
        } catch (error) {
            setLoading(false);
            showToast("error", "Verification Failed", "Network error, please try again.");
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

            <Toast config={toastConfig} />
        </View>
    );
};

// ✅ Fix: Ensure correct TypeScript typing for toastConfig
const toastConfig: ToastConfig = {
    success: ({ text1, text2 }: ToastConfigParams<any>) => (
        <View style={[styles.toastContainer, { backgroundColor: "green" }]}>
            <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{text1}</Text>
            <Text style={[styles.toastText, { fontSize: 20 }]}>{text2}</Text>
        </View>
    ),
    error: ({ text1, text2 }: ToastConfigParams<any>) => (
        <View style={[styles.toastContainer, { backgroundColor: "red" }]}>
            <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{text1}</Text>
            <Text style={[styles.toastText, { fontSize: 20 }]}>{text2}</Text>
        </View>
    ),
    info: ({ text1, text2 }: ToastConfigParams<any>) => (
        <View style={[styles.toastContainer, { backgroundColor: "blue" }]}>
            <Text style={[styles.toastText, { fontSize: 24, fontWeight: "bold" }]}>{text1}</Text>
            <Text style={[styles.toastText, { fontSize: 20 }]}>{text2}</Text>
        </View>
    ),
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#A3B18A", alignItems: "center", justifyContent: "center" },
    form: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    label: { fontSize: 16, color: "#000", marginBottom: 5 },
    input: { height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
    verifyButton: { backgroundColor: "#222", paddingVertical: 12, borderRadius: 5, alignItems: "center", marginBottom: 15 },
    verifyText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    toastContainer: {
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        alignSelf: "center",
        marginTop: 50,
    },
    toastText: {
        color: "#fff",
        textAlign: "center",
    },
});

export default Verification;
