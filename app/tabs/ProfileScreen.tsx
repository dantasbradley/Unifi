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
        backgroundColor: editMode ? '#fff' : '#70A9A1', // White when editing, black otherwise
        color: editMode ? '#000' : '#fff', // Black text when editing, white otherwise
        padding: 12,
        borderRadius: 5,
    });

    useEffect(() => {
        fetchUserName();
        fetchEmail(); //fetchImage() is called inside this fetch
    }, []);

    const getCognitoSub = async () => {
        try {
          const value = await AsyncStorage.getItem('cognitoSub');
          if (value !== null) {
            console.log('cognitoSub retrieved successfully:', value);
            return value;
          }
        } catch (e) {
          console.error('Failed to retrieve cognitoSub', e);
        }
        return null;
    };

    const fetchUserName = async () => {
        const cognitoSub = await getCognitoSub();
        if (!cognitoSub) {
            console.error("Cognito sub not found in localStorage.");
            return;
        }
        const response = await fetch("http://3.85.25.255:3000/get-user-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sub: cognitoSub })
        });
        const data = await response.json();
        if (response.ok) {
            setName(data.name);
            setOriginalName(data.name);
        } else {
            console.error("Error fetching name:", data.message);
        }
    };

    const fetchEmail = async () => {
        const cognitoSub = await getCognitoSub();
        if (!cognitoSub) {
            console.error("Cognito sub not found in localStorage.");
            return;
        }
        const response = await fetch("http://3.85.25.255:3000/get-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sub: cognitoSub })
        });
        const data = await response.json();
        if (response.ok) {
            setEmail(data.email);
            fetchImage(data.email); // Call fetchImage directly with the fetched email.
        } else {
            console.error("Error fetching email:", data.message);
        }
    };

    const fetchImage = async (_email : any) => {
        try {
            const emailPrefix = _email.split('@')[0];
            // const emailPrefix = 'amakam';
            const filePath = `user_profile_pics/${emailPrefix}`;
            const response = await fetch(`http://3.85.25.255:3000/get-user-image?filepath=${filePath}`);
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
            quality: 1,  // Consider whether you need the base64 encoding now
        });
    
        if (!result.canceled) {
            // console.log('Image URI:', result.assets[0].uri);

            const emailPrefix = email.split('@')[0];
            const key = `user_profile_pics/${emailPrefix}`;
            // const key = 'user_profile_pics/amakam';
            uploadImage(result.assets[0].uri, key);  // Call the upload function with the URI of the picked image
        }

    };
    

    const uploadImage = async (imageUri : any, key : any) => {
        // Fetch the pre-signed URL from your backend
        const response = await fetch(`http://3.85.25.255:3000/generate-presigned-url?key=${key}`);
        const { url } = await response.json();
    
        // Fetch the blob from the local file URI
        const blob = await (await fetch(imageUri)).blob();
    
        // Use the pre-signed URL to upload the blob
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: blob,
        });
    
        if (uploadResponse.ok) {
            console.log('Image successfully uploaded to cloud storage');
            alert('Upload successful!');
            // Optionally update the state or UI to reflect the upload success
        } else {
            console.error('Failed to upload image', await uploadResponse.text());
            alert('Upload failed!');
        }
        console.log("Fetch.");
        fetchImage(email);
        console.log("Fetch done.");
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
        const cognitoSub = await getCognitoSub();
        if (!cognitoSub) {
            console.error("Cognito sub not found.");
            return;
        }
        if (name !== originalName) {
            const response = await fetch("http://3.85.25.255:3000/change-user-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sub: cognitoSub, newName: name })
            });
            if (response.ok) {
                console.log("Name updated successfully.");
                setOriginalName(name);
            } else {
                const data = await response.json();
                console.error("Error updating name:", data.message);
            }
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
        backgroundColor: '#40798C',
        padding: 20,
    },
    header: {
        backgroundColor: '#40798C',
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
        backgroundColor: '#70A9A1',
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
