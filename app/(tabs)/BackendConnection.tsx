import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';

export default function BackendConnection() {
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://3.84.91.69:3000/api/data'); // Use your IP address if needed
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
        marginBottom: 10,
    },
    data: {
        marginTop: 20,
        fontSize: 16,
        color: 'green',
    },
    error: {
        marginTop: 20,
        fontSize: 16,
        color: 'red',
    },
});
