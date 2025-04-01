import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const router = useRouter();
    const [originalName, setOriginalName] = useState('');
    const [email, setEmail] = useState('user@example.com');
    const [image, setImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [notifications, setNotifications] = useState({
        communityUpdates: true,
        nearbyUpdates: true,
        eventReminders: true,
        other: true,
    });

    // Define dynamic styles based on editMode
    const getInputStyle = () => ({
        flex: 1,
        backgroundColor: editMode ? '#fff' : '#000', // White when editing, black otherwise
        color: editMode ? '#000' : '#fff', // Black text when editing, white otherwise
        padding: 12,
        borderRadius: 5,
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
            // console.log("Signed URL: ", data.url);
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
            // console.log('Image URI:', result.assets[0].uri);
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
            // Use the pre-signed URL to upload the blob
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: blob,
            });
            fetchImage(filePath, `user_profile_pics/default`);
            // fetchImage(`club_profile_pics/${id}_${name}`, `user_profile_pics/default`);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Upload failed!');
        }
    };
    

    const toggleNotification = (key: keyof typeof notifications, newValue: boolean) => {
        setNotifications(prevNotifications => ({
            ...prevNotifications,
            [key]: newValue
        }));
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

    // Function to fetch a user attribute from Cognito
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
    
    // Function to update a user attribute in Cognito
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
                    <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
                        <Text style={styles.buttonText}>{editMode ? 'Save' : 'Edit'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    ) : (
                        <Text>Loading image...</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                    <Text style={styles.uploadButtonText}>📂 Select file to upload</Text>
                </TouchableOpacity>
                {image && <Text style={styles.uploadedText}>{image.split('/').pop()} uploaded</Text>}
                
                {/* Input container for Full Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name:</Text>
                    <TextInput 
                        style={getInputStyle()}  // Apply dynamic styles here
                        value={name} 
                        onChangeText={setName} 
                        placeholder="Full Name"
                        editable={editMode} 
                    />
                </View>
                
                {/* Input container for Email */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.input}>{email}</Text>
                </View>
                
                {/* Notifications Section */}
                <Text style={styles.sectionHeader}>Notifications</Text>
                {Object.entries(notifications).map(([key, value]) => (
                    <View key={key} style={styles.notificationRow}>
                        <Text style={styles.notificationText}>
                            {key === 'communityUpdates' && 'Receive updates from the communities you follow'}
                            {key === 'nearbyUpdates' && 'Receive updates from nearby communities based on interests'}
                            {key === 'eventReminders' && 'Receive reminders of upcoming events'}
                            {key === 'other' && 'Receive ...'}
                        </Text>
                        <Switch
                            value={value}
                            onValueChange={(newValue) => {
                                if (editMode) {
                                    toggleNotification(key as keyof typeof notifications, newValue);
                                }
                            }}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    header: {
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signOutButton: {
        padding: 10,
        backgroundColor: '#c00',  // Red color for the sign-out button
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
    sectionHeader: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        color: '#fff',
        marginRight: 10,
        width: 100,  // Fixed width for alignment
    },
    input: {
        flex: 1,
        backgroundColor: '#000',
        color: '#fff',
        padding: 12,
        borderRadius: 5,
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
    placeholderImage: {
        width: 150,
        height: 150,
        borderRadius: 10,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    uploadButton: {
        backgroundColor: '#d3d3d3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    uploadButtonText: {
        fontWeight: 'bold',
    },
    uploadedText: {
        color: '#fff',
        marginBottom: 10,
    },
    notificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    notificationText: {
        color: '#fff',
        flex: 1,
        marginRight: 10,
    },
    editButton: {
        padding: 10,
        backgroundColor: '#666',
        borderRadius: 5,
        marginRight: 15, // Adjusted right margin for spacing
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emailContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    inputLabel: {
        color: '#fff',
        marginBottom: 10,
        marginLeft: 90
    },
    emailLabel: {
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    }
});

export default ProfileScreen;
