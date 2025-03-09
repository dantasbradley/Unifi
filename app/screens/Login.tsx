import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";

const Login = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initState, setInitState] = useState(true);
  const [filled, setFilled] = useState([false, false]); // [email, password]

  const black = "#000";
  const gray = "#aaa";

  function checkInputChange(text: string, index: number): void {
    const updatedState = [...filled];
    updatedState[index] = text !== "";
    setFilled(updatedState);
  }

  const handleLogin = async () => {
    setInitState(false); // Trigger validation on login attempt
    if (!filled.every(Boolean)) {
      return; // Prevent login if fields are missing
    }
  
    setLoading(true);
    try {
      const response = await fetch("http://3.85.25.255:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          const result = await response.json();
          Alert.alert("Login Failed", result.message);
  
          // Reset fields and validation
          setEmail("");
          setPassword("");
          setFilled([false, false]);
          setInitState(true); // Reset field colors after invalid login
  
          return;
        }
        throw new Error("Something went wrong.");
      }
  
      const result = await response.json();
      Alert.alert("Success", result.message || "Logged in successfully!");
  
      // Navigate to HomeScreen on successful login
      navigation.replace('/tabs/HomeScreen');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
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
          placeholderTextColor={!initState && !filled[0] ? black : gray}
          keyboardType="email-address"
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
          placeholderTextColor={!initState && !filled[1] ? black : gray}
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
          <Text style={styles.loginText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => alert("Button was clicked")}>
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
