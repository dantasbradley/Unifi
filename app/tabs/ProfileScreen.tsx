import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('user@example.com');
    const [image, setImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [notifications, setNotifications] = useState({
        communityUpdates: true,
        nearbyUpdates: true,
        eventReminders: true,
        other: true,
    });

    const handleImageUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const toggleNotification = (key: keyof typeof notifications, newValue: boolean) => {
        setNotifications(prevNotifications => ({
            ...prevNotifications,
            [key]: newValue
        }));
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
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
            <View style={styles.imageContainer}> {/* Allows the image to be centered */}
                  {image ? (
                      <Image source={{ uri: image }} style={styles.image} />
                  ) : (
                      <View style={styles.placeholderImage}>
                          <Text>None</Text>
                      </View>
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
    inputLabel: {
        color: '#fff',
        marginBottom: 10,
        marginLeft: 90
    },
    emailContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emailLabel: {
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    }
});

export default ProfileScreen;
