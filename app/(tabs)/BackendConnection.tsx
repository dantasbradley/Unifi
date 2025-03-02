import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackendConnection() {
    const navigation = useNavigation();
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://3.84.91.69:3000/api/data'); // Consider moving this to an env variable
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(result.message);
        } catch (err) {
            setError('Error fetching data');
            console.error(err);
        }
        setLoading(false);
    };

    const fetchDatabase = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://3.84.91.69:3000/api/db-test'); // Consider moving this to an env variable
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(result.message);
        } catch (err) {
            setError('Error fetching data');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backend Connection</Text>
            
            <Button title="Fetch Data from Backend" onPress={fetchData} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {data && <Text style={styles.data}>Response: {data}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Fetch Data from Database" onPress={fetchDatabase} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {data && <Text style={styles.data}>Response: {data}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            
            <View style={styles.backButtonContainer}>
                <Button title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    data: {
        marginTop: 20,
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
    },
    error: {
        marginTop: 20,
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    backButtonContainer: {
        marginTop: 20,
    },
});

