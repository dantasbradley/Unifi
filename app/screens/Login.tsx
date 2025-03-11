import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router"; // ✅ Use useRouter() instead of useNavigation()
import Toast from "react-native-toast-message"; // Import toast message library

const Login = () => {
  const router = useRouter(); // ✅ Use router for navigation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initState, setInitState] = useState(true);
  const [filled, setFilled] = useState([false, false]); // [email, password]

  function checkInputChange(text: string, index: number): void {
    const updatedState = [...filled];
    updatedState[index] = text.trim() !== "";
    setFilled(updatedState);
  }

  const handleLogin = async () => {
    setInitState(false);
    if (!filled.every(Boolean)) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields before logging in.",
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
          });
          return;
        }
        throw new Error("Something went wrong.");
      }

      // Show success message
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Logged in successfully!",
      });

      // Navigate **directly after showing toast**
      setTimeout(() => {
        router.push("/tabs/HomeScreen");
      }, 1000); // ✅ Ensure correct path

    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            !initState && !filled[0] ? styles.red : styles.white,
          ]}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            checkInputChange(text, 0);
          }}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[
            styles.input,
            !initState && !filled[1] ? styles.red : styles.white,
          ]}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            checkInputChange(text, 1);
          }}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Toast.show({ type: "info", text1: "Reset Password", text2: "Feature coming soon!" })}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        {!initState && (
          <FlatList
            data={[0, 1]}
            renderItem={({ item }) => {
              const fieldNames = ["Email", "Password"];
              if (!filled[item]) {
                return (
                  <Text style={styles.missingListText}>
                    ** Missing {fieldNames[item]} **
                  </Text>
                );
              }
              return null;
            }}
            keyExtractor={(item) => item.toString()}
          />
        )}
      </View>

      {/* Add Toast Component */}
      <Toast />
    </View>
  );
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
  white: {
    backgroundColor: "#fff",
  },
  red: {
    backgroundColor: "#FF474C",
  },
  missingListText: {
    color: "#FF474C",
    fontWeight: "bold",
  },
});

export default Login;
