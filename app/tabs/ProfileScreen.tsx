import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const [name, setName] = useState('');
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

    useEffect(() => {
        fetchUserName();
        fetchEmail();
        fetchImage();
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
        } else {
            console.error("Error fetching email:", data.message);
        }
    };

    const fetchImage = async () => {
        try {
            // const emailPrefix = email.split('@')[0];
            const emailPrefix = 'amakam';
            const response = await fetch(`http://3.85.25.255:3000/get-user-image?filename=${emailPrefix}`);
            const data = await response.json();
            console.log("Signed URL: ", data.url);
            setImageUrl(data.url);
        } catch (error) {
            console.error('Failed to fetch image:', error);
        }
    };

    // const handleImageUpload = async () => {
    //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (permissionResult.granted === false) {
    //         alert("You've refused to allow this app to access your photos!");
    //         return;
    //     }

    //     // const result = await ImagePicker.launchImageLibraryAsync({
    //     //     mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct usage
    //     //     allowsEditing: true,
    //     //     aspect: [1, 1],
    //     //     quality: 1,
    //     // });
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [1, 1],
    //         quality: 1,
    //         base64: true,  // Enable base64 data
    //     }) as any;

    //     if (!result.canceled) {
    //         // const fileUri = result.assets[0].uri;
    //         // console.log('File URI:', fileUri);
    //         // const response = await fetch(fileUri);
    //         // console.log('Fetched File URI');
    //         // const blob = await response.blob();
    //         // console.log('got blob response');
    //         // let formData = new FormData();
    //         // console.log('new form data');
    //         // formData.append('image', blob);
    //         // console.log('append image with blob data');
    //         // console.log('blob: ', blob, 'filename.png');
    //         // console.log('formData: ', formData);
    //         // console.log('Base64 Data:', result.base64.substring(0, 100));

    //         try {
    //             console.log('in try block');
    //             const uploadResponse = await fetch('http://3.85.25.255:3000/upload', {
    //                 // method: 'POST',
    //                 // body: formData,
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     image: result.base64,
    //                     filename: 'upload.png'
    //                 }),
    //             });
    //             if (!uploadResponse.ok) throw new Error(`HTTP status ${uploadResponse.status}`);
    //             console.log('after upload response');
    //             const uploadData = await uploadResponse.json();
    //             console.log(uploadData);
    //             if (uploadResponse.ok) {
    //                 alert('Upload successful!');
    //             } else {
    //                 alert('Upload failed!');
    //             }
    //         } catch (error) {
    //             console.error("Error uploading file:", error);
    //             alert('Upload failed!');
    //         }
    //     }
    // };

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
            console.log('Image URI:', result.assets[0].uri);
            uploadImage(result.assets[0].uri);  // Call the upload function with the URI of the picked image
        }

    };
    

    const uploadImage = async (imageUri : any) => {
        // Fetch the pre-signed URL from your backend
        const response = await fetch('http://3.85.25.255:3000/generate-presigned-url');
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
        fetchImage();
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
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Account</Text>
                <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
                    <Text style={styles.editButtonText}>{editMode ? 'Save' : 'Edit'}</Text>
                </TouchableOpacity>
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
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name:</Text>
                    <TextInput 
                        style={styles.input} 
                        value={name} 
                        onChangeText={setName} 
                        placeholder="Full Name"
                        editable={editMode} 
                    />
                </View>
                <View style={styles.emailContainer}>
                    <Text style={styles.emailLabel}>Email: {email}</Text>
                </View>
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
    input: {
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
        color: '#fff',
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
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
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
