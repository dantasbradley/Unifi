import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import EditToggleButton from "../components/ExploreComponents/EditToggleButton";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const router = useRouter();
    const [originalName, setOriginalName] = useState('');
    const [email, setEmail] = useState('user@example.com');
    const [image, setImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    // Define dynamic styles based on editMode
    const getInputStyle = () => ({
        flex: 1,
        backgroundColor: editMode ? '#D3D3D3' : '#fff', // Grey when editing, white otherwise
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        borderColor: '#000',
    });

    useEffect(() => {
        fetchUserAttribute("name").then((name) => {
            if (name) {
                setName(name);
                setOriginalName(name);
            }
        });
        fetchUserAttribute("email").then((email) => {
            if (email) {
                setEmail(email);
                const emailPrefix = email.split('@')[0];
                const filePath = `user_profile_pics/${emailPrefix}`;
                fetchImage(filePath, `user_profile_pics/default`);
            }
        });
    }, []);

    const fetchImage = async (filePath : any, defaultPath : any) => {
        try {
            console.log("filePath: ", filePath);
            const response = await fetch(`http://3.85.25.255:3000/S3/get/image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`);
            const data = await response.json();
            setImageUrl(data.url);
        } catch (error) {
            console.error('Failed to fetch image:', error);
        }
      };

    const handleImageUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("You've refused to allow this app to access your photos!");
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    
        if (!result.canceled) {
            const emailPrefix = email.split('@')[0];
            const filePath = `user_profile_pics/${emailPrefix}`;
            uploadImage(filePath, result.assets[0].uri);
        }

    };
    
    const uploadImage = async (filePath : any, imageUri : any) => {
        try {
            console.log("filePath: ", filePath);
            const response = await fetch(`http://3.85.25.255:3000/S3/get/upload-signed-url?filePath=${encodeURIComponent(filePath)}`);
            const { url } = await response.json();
            const blob = await (await fetch(imageUri)).blob();
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: blob,
            });
            fetchImage(filePath, `user_profile_pics/default`);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Upload failed!');
        }
    };
    
    const toggleEditMode = () => {
        if (editMode) {
            handleSave();
        }
        setEditMode(!editMode);
    };

    const handleSignOut = async () => {
        await AsyncStorage.clear();  // Clear all AsyncStorage data
        setTimeout(() => {
            router.replace("/screens/AuthScreen");
        }, 1000);
    };

    const handleSave = async () => {
        if (name !== originalName) {
            updateUserAttribute("name", name);
            setOriginalName(name);
        }
    };

    const fetchUserAttribute = async (attributeName : any) => {
        const cognitoSub = await AsyncStorage.getItem('cognitoSub');
        try {
            const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);    
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);
            console.log(`${attributeName} fetched successfully:`, data[attributeName]);
            return data[attributeName];
    
        } catch (error) {
            console.error("Network error while fetching attribute:", error);
            return null;
        }
    };
    
    const updateUserAttribute = async (attributeName : any, value : any) => {
        const cognitoSub = await AsyncStorage.getItem('cognitoSub');
        try {
            const response = await fetch(`http://3.85.25.255:3000/cognito/update/attribute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sub: cognitoSub, attributeName, value }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);
            console.log(`${attributeName} updated successfully.`);
            return true;

        } catch (error) {
            console.error("Network error while updating attribute:", error);
            return false;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Account</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile card with image and name */}
            <View style={styles.profileCard}>
                <View style={{ position: 'absolute', top: 10, right: 10 }}>
                    <EditToggleButton editMode={editMode} onPress={toggleEditMode} />
                </View>
                <View style={styles.imageWrapper}>
                    {editMode ? (
                        <TouchableOpacity onPress={handleImageUpload} style={{ alignItems: 'center' }}>
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                            <Text style={styles.changeImageText}>Change Image</Text>
                        </TouchableOpacity>
                    ) : (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    )}
                </View>
                    {/* Display user's name */}
                    <Text style={styles.nameText}>{name}</Text>
                    {/* Display user's email */}
                    <Text style={styles.emailText}>{email}</Text>
                    {/* Editable name input when in edit mode */}
                    {editMode && (
                        <TextInput
                            style={getInputStyle()}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                            editable={editMode}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DAD7CD',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        backgroundColor: '#344E41',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signOutButton: {
        padding: 8,
        backgroundColor: '#5C614A',
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileCard: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageWrapper: {
        position: 'relative',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
        color: '#344E41',
    },
    emailText: {
        fontSize: 14,
        color: '#6b6b6b',
        marginBottom: 10,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginVertical: 10,
    },
    changeImageText: {
        textAlign: 'center',
        color: '#344E41',
        fontWeight: '500',
        marginTop: 4,
    },
});

export default ProfileScreen;
