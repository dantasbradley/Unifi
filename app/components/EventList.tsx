import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Pressable, FlatList } from "react-native";

interface EventListProps {
    date: string,
    events: Event[],
    refreshing: boolean,
    onRefresh: () => void
};

type Event = {
    date: string,
    title: string,
    description: string,
    location: string,
    time: string
    // organization: string,
    // startTime: string,
    // endTime: string
}

const EventList: React.FC<EventListProps> = ({ date, events, refreshing, onRefresh }) => {

    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

    useEffect(() => {
        // const filteredEvents = date ? events.filter(event => event.date === date) : [];
        console.log("----------------");
        const filtered = date && Array.isArray(events) ? events.filter(event => {
            console.log("Filtering event:", event);
            return event.date === date;
        }) : [];

        console.log("=Filtered events:", filtered);
        setFilteredEvents(filtered);
    }, [date]);

    return(
        <View>
            <Text> Events for {date}</Text>
            {filteredEvents.length > 0 ? (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item.title}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => (
                        <View style={styles.event}>
                            <Text style={styles.header}>{item.title}</Text>
                            {/* <Text style={styles.body}>Organization: {item.organization}</Text> */}
                            <Text style={styles.body}>Time: {item.time}</Text>
                            <Text style={styles.body}>Location: {item.location}</Text>
                            <Text style={styles.body}>Description: {item.description}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.event}>No events scheduled</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        flex: 1
    },
    event: {
        borderRadius: 5,
        backgroundColor: '#cfcfcf',
        marginBottom: 10,
        width: 300
    },
    header: {
        backgroundColor: '000',
        borderBottomWidth: 1,
        fontWeight: 'bold',
        paddingHorizontal: 5,
    },
    body: {
        backgroundColor: '000',
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 2
    },
    emptyListText: {

    },
})

export default EventList;