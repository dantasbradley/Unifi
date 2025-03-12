import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Pressable, FlatList } from "react-native";

interface EventListProps {
    date: string,
    profile: string
};

type Event = {
    title: string,
    organization: string,
    startTime: string,
    endTime: string,
    location: string,
    descrition: string
}

const EventList: React.FC<EventListProps> = ({ date, profile }) => {

    const [events, setEvents] = useState<Event[] | null>(null);

    //Fetch the events from the backend
    const getEvents = async () => {
        try {
            const url = `http://3.84.91.69:3000/${profile}/${date}`;
            const res = await fetch(url, {method: 'GET'});
            const json = await res.json();
            setEvents(json.events);
        }
        catch (err) {
            console.error(err);
            const testEvents: Event[] = [{title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort booksdflasdugfhkajlsdhfalkshdfaklsjdfhaslkdfhalskdfhjaslkdfhjalksdfjhalskd", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}, {title: "Book Sorting", organization: "Alachua County Library", startTime: "12:00 a.m.", endTime: "1:00 p.m.", descrition: "Help sort books", location:"Library"}]
            setEvents(testEvents);
        }
    }

    useEffect(() => {getEvents()}, []);

    //Rendered when there are no events scheduled on a particular day
    const emptyList: React.JSX.Element = (
        <Text style={styles.event}>
            No events scheduled
        </Text>
    );

    const fullList = (
        <FlatList scrollEnabled={true} data={events} renderItem={({item}) => {
            return (
                <View style={styles.event}>
                    <Text style={styles.header}>{item.title}</Text>
                    <Text style={styles.body}>Organization: {item.organization}</Text>
                    <Text style={styles.body}>Time: {item.startTime} - {item.endTime}</Text>
                    <Text style={styles.body}>Location: {item.location}</Text>
                    <Text style={styles.body}>Description: {item.descrition}</Text>
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
        borderRadius: 5
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