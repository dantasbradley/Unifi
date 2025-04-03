import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Pressable, FlatList } from "react-native";
import XDate from "xdate";

interface EventListProps {
    date: string,
};

type Event = {
    title: string,
    organization: string,
    startTime: string,
    endTime: string,
    location: string,
    description: string
}

const EventList: React.FC<EventListProps> = ({ date }) => {

    const [events, setEvents] = useState<Event[] | null>(null);

    // Fetch the events from the backend
    // Backend function needs to be developed
    const getEvents = async () => {
        try {
            // This is just for testing purposes
            // if (date === XDate.today().toDateString()) {
            //     const testEvents: Event[] = [{title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort booksdflasdugfhkajlsdhfalkshdfaklsjdfhaslkdfhalskdfhjaslkdfhjalksdfjhalskd", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}]
            //     setEvents(testEvents);
            // }
            // else {
            //     setEvents(null);
            // }
            const cognitoSub = await getCognitoSub();

            if (!cognitoSub) {
                console.error("Cognito sub not found in localStorage.");
                return;
            }

            const url = `http://3.84.91.69:3000/date/${date}`;
            const res = await fetch(url, {
                method: 'POST', headers: {
                "Content-Type": "application/json",},
                body: JSON.stringify({ sub: cognitoSub })
            });

            const data = await res.json();

            if (res.ok) {
                setEvents(data.events);
            }
            else {
                console.error("Error fetching events: ", data.message);
            }
            
        }
        catch (err) {
            console.error(err);
            //const testEvents: Event[] = [{title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort booksdflasdugfhkajlsdhfalkshdfaklsjdfhaslkdfhalskdfhjaslkdfhjalksdfjhalskd", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}]
            //setEvents(testEvents);
        }
    }

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

    useEffect(() => {getEvents()}, [date]);

    //Rendered when there are no events scheduled on a particular day
    const emptyList: React.JSX.Element = (
        <Text style={styles.event}>
            No events scheduled
        </Text>
    );

    const fullList = (
        <FlatList scrollEnabled={true} showsVerticalScrollIndicator={false} data={events} renderItem={({item}) => {
            return (
                <View style={styles.event}>
                    <Text style={styles.header}>{item.title}</Text>
                    <Text style={styles.body}>Organization: {item.organization}</Text>
                    <Text style={styles.body}>Time: {item.startTime} - {item.endTime}</Text>
                    <Text style={styles.body}>Location: {item.location}</Text>
                    <Text style={styles.body}>Description: {item.description}</Text>
                </View>
            )
        }}/>
    )

    return(
        <View style={styles.container}>
            {events !== null ? fullList : emptyList}
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