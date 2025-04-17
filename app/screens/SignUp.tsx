import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";

const SignUp = () => {
    const router = useRouter();
    const [minLength, setMinLength] = useState(false);
    const [hasUpper, setHasUpper] = useState(false);
    const [hasLower, setHasLower] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecial, setHasSpecial] = useState(false);

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

    const updatePasswordRequirements = (password: string) => {
        setMinLength(password.length >= 8);
        setHasUpper(/[A-Z]/.test(password));
        setHasLower(/[a-z]/.test(password));
        setHasNumber(/\d/.test(password));
        setHasSpecial(/[@$!%*?&#]/.test(password));
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
                <TextInput style={styles.input} placeholder="Enter your first name" value={firstName} placeholderTextColor="#888" onChangeText={setFirstName} />

                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} placeholder="Enter your last name" value={lastName} placeholderTextColor="#888" onChangeText={setLastName} />

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="Enter your email" keyboardType="email-address" value={email} placeholderTextColor="#888" onChangeText={setEmail} />
                
                <Text style={styles.label}>Password</Text>
                
                <View style={styles.passwordRequirements}>
                    <Text style={[styles.requirement, minLength ? styles.met : null]}>• At least 8 characters</Text>
                    <Text style={[styles.requirement, hasUpper ? styles.met : null]}>• Includes an uppercase letter</Text>
                    <Text style={[styles.requirement, hasLower ? styles.met : null]}>• Includes a lowercase letter</Text>
                    <Text style={[styles.requirement, hasNumber ? styles.met : null]}>• Includes a number</Text>
                    <Text style={[styles.requirement, hasSpecial ? styles.met : null]}>• Includes a special character</Text>
                </View>
                
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    placeholderTextColor="#888"
                    onChangeText={(text) => {
                        setPassword(text);
                        updatePasswordRequirements(text);
                    }}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput style={styles.input} placeholder="Re-enter your password" secureTextEntry value={passwordConf} placeholderTextColor="#888" onChangeText={setPasswordConf} />

                <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign Up</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#A3B18A", alignItems: "center", justifyContent: "center" },
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
    passwordRequirements: { marginBottom: 15 }, // Ensure alignment
    requirement: {
        fontSize: 14,
        marginBottom: 4,
        color: 'black', // Default color
    },
    met: {
        color: 'green' // Styling for the password requirements text
    }
});

export default SignUp;
