import { Link } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const SignUp = ({ navigation }: any ) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [passwordConf, setPasswordConf] = useState("");
    const [initState, setInitState] = useState(true);
    const [filled, setFilled] = useState([false, false, false, false, false]); //[email, password, firstName, lastName, passwordConf]

    const black = "#000";
    const gray = "#aaa";

    // async function sendAccountInfo(email: string, password: string, firstName: string, lastName: string) {
    //     fetch("http://")
    // }

    const contSel: React.JSX.Element = (
        <Link href={"/screens/ProfileSetup"} asChild>
            <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </Link>
    );
        
        const contDesel: React.JSX.Element = (
            <TouchableOpacity style={styles.continueButton} onPress={() => setInitState(false)}>
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
    );

    //Updates the filled state array
    function checkInputChange(text: string, index: number) : void {
        var updatedState: boolean[] = filled;
        if (text === "") updatedState[index] = false;
        else updatedState[index] = true;
        setFilled(updatedState);
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.form}>
                {/* First Name Input */}
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={[styles.input, filled[2] || initState ? styles.white : styles.red]}
                    placeholder="e.g. John"
                    placeholderTextColor={filled[2] || initState ? gray : black}
                    keyboardType="email-address"
                    value={firstName}
                    onChangeText={(text) => {
                        setFirstName(text); 
                        checkInputChange(text, 2);
                    }}
                />

                {/* Last Name Input */}
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={[styles.input, filled[3] || initState ? styles.white : styles.red]}
                    placeholder="e.g. Smith"
                    placeholderTextColor={filled[3] || initState ? gray : black}
                    keyboardType="email-address"
                    value={lastName}
                    onChangeText={(text) => {
                        setLastName(text);
                        checkInputChange(text, 3);
                    }}
                />

                {/* Email Input */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, filled[0] || initState ? styles.white : styles.red]}
                    placeholder="Enter your email"
                    placeholderTextColor={filled[0] || initState ? gray : black}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        checkInputChange(text, 0);
                    }}
                />

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={[styles.input, (filled[1] || initState) && password === passwordConf ? styles.white : styles.red]}
                    placeholder="Enter your password"
                    placeholderTextColor={(filled[1] || initState) && password === passwordConf ? gray : black}
                    secureTextEntry // Hides text input (for passwords)
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        checkInputChange(text, 1);
                    }}
                />

                {/* Password Confirmation Input */}
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={[styles.input, (filled[4] || initState) && password === passwordConf ? styles.white : styles.red]}
                    placeholder="Confirm your password"
                    placeholderTextColor={(filled[4] || initState) && password === passwordConf ? gray : black}
                    secureTextEntry // Hides text input (for passwords)
                    value={passwordConf}
                    onChangeText={(text) => {
                        setPasswordConf(text);
                        checkInputChange(text, 4);
                    }}
                />

                {/* Continue Button */}
                {password === passwordConf && filled.every(Boolean) ? contSel : contDesel}

                {/* Missing Items */}
                <FlatList data={[0, 1, 2, 3, 4]} 
                renderItem={({item}) => {
                    const stateArrayToField = ["Email", "Password", "First Name", "Last Name"];
                    if (!initState && !filled[item] && item !== 4) {
                        return <Text style={styles.missingListText}>** Missing {stateArrayToField[item]} **</Text>
                    }
                    else if (!initState && !filled[item] && item === 4 && filled[1]) {
                        return <Text style={styles.missingListText}>** Please Confirm Password **</Text>
                    }
                    else if (item === 4 && filled[item] && filled[1] && password !== passwordConf) {
                        return <Text style={styles.missingListText}>** Passwords Do Not Match **</Text>
                    }
                    else return null
                }}/>
                
            </View>
        </View>
    );
}

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
    continueButton: {
        backgroundColor: "#222",
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 15,
    },
    continueText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    white: {
        backgroundColor: "#fff"
    },
    red: {
        backgroundColor: "#FF474C"
    },
    missingListText: {
        color: "#FF474C",
        fontWeight: "bold"
    }
  });

export default SignUp;