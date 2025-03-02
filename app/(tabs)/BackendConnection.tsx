import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackendConnection() {
    const navigation = useNavigation();

    const [backendData, setBackendData] = useState<string | null>(null);
    const [backendLoading, setBackendLoading] = useState(false);
    const [backendError, setBackendError] = useState<string | null>(null);

    const [dbData, setDbData] = useState<string | null>(null);
    const [dbLoading, setDbLoading] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    const fetchData = async () => {
        setBackendLoading(true);
        setBackendError(null);
        setBackendData(null);
        try {
            const response = await fetch('http://3.84.91.69:3000/api/data');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setBackendData(result.message);
        } catch (err) {
            setBackendError('Error fetching backend data');
            console.error(err);
        }
        setBackendLoading(false);
    };

    const fetchDatabase = async () => {
        setDbLoading(true);
        setDbError(null);
        setDbData(null);
        try {
            const response = await fetch('http://3.84.91.69:3000/api/db-test');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setDbData(result.message);
        } catch (err) {
            setDbError('Error fetching database data');
            console.error(err);
        }
        setDbLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backend Connection</Text>

            <Button title="Fetch Data from Backend" onPress={fetchData} />
            {backendLoading && <ActivityIndicator size="large" color="#0000ff" />}
            {backendData && <Text style={styles.data}>Response: {backendData}</Text>}
            {backendError && <Text style={styles.error}>{backendError}</Text>}

            <View style={{ marginTop: 30 }} />

            <Button title="Fetch Data from Database" onPress={fetchDatabase} />
            {dbLoading && <ActivityIndicator size="large" color="#0000ff" />}
            {dbData && <Text style={styles.data}>Response: {dbData}</Text>}
            {dbError && <Text style={styles.error}>{dbError}</Text>}

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
