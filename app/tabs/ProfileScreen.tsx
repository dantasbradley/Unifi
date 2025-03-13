import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);
    // each notification type is set by a boolean
    const [notifications, setNotifications] = useState({
        communityUpdates: true,
        nearbyUpdates: true,
        eventReminders: true,
        other: true, // TODO: change the name of this later and add more as needed
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

    {/* restricts key to only valid, exact keys of the notifications object */}
    const toggleNotification = (key: keyof typeof notifications) => {
        const updatedNotifications = { ...notifications };
        updatedNotifications[key] = !notifications[key];
        setNotifications(updatedNotifications);
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Account</Text>
            </View>

            {/* Rest of Content */}
            <ScrollView style={styles.container}>
                <Text style={styles.sectionHeader}>Contact Information</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
                <TextInput style={styles.input} value={email} onChangeText={setEmail} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

                <Text style={styles.sectionHeader}>Password</Text>
                <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

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
                            onValueChange={() => toggleNotification(key as keyof typeof notifications)}
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
        backgroundColor: '#d3d3d3',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
        color: '#000',
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
});

export default ProfileScreen;