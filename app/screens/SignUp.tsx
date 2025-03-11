import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";

const SignUp = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConf, setPasswordConf] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    const isValidPassword = (password: string) => password.length >= 8;

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

    const handleSignUp = async () => {
        if (!email || !password || !firstName || !lastName || !passwordConf) {
            showToast("error", "Missing Fields", "Please fill in all fields.");
            return;
        }
        if (!isValidEmail(email)) {
            showToast("error", "Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (!isValidPassword(password)) {
            showToast("error", "Weak Password", "Password must be at least 8 characters long.");
            return;
        }
        if (password !== passwordConf) {
            showToast("error", "Password Mismatch", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://3.85.25.255:3000/signup_cognito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            const result = await response.json();
            setLoading(false);

            if (!response.ok) {
                showToast("error", "Signup Failed", result.message);
                return;
            }

            showToast("success", "Signup Successful", "Check your email for verification.");
            setTimeout(() => router.push(`/screens/Verification?email=${encodeURIComponent(email)}`), 1000);

        } catch (error) {
            setLoading(false);
            showToast("error", "Signup Failed", "Network error, please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />

                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />

                <Text style={styles.label}>Password</Text>
                <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={passwordConf} onChangeText={setPasswordConf} />

                <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign Up</Text>}
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
    container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
    form: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    label: { fontSize: 16, color: "#000", marginBottom: 5 },
    input: { height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
    signupButton: { backgroundColor: "#222", paddingVertical: 12, borderRadius: 5, alignItems: "center", marginBottom: 15 },
    signupText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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

export default SignUp;