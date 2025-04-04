import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, RefreshControl, ScrollView, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import XDate from "xdate";
import EventList from "../components/EventList";
import { CommunitiesContext } from "../contexts/CommunitiesContext";

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

const CalendarScreen = () => {
  const today = new XDate().toDateString();

  const [markedDate, setMarkedDate] = useState({});
  const [selectedDate, setSelectedDate] = useState<XDate | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const {
  joinedCommunities = new Set(),
  fetchEventsForClub = () => {}
  } = useContext(CommunitiesContext) || {};

  // Function to refresh the community list
  const handleRefresh = async () => {
    console.log("refreshing page");
    setRefreshing(true);
    try {
      setRefreshKey(Date.now());
    } catch (error) {
      console.error("Error refreshing communities:", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
      setEvents([]);
      console.log("joinedCommunities changed in event list");
      console.log("Joined clubs:", Array.from(joinedCommunities));
      joinedCommunities.forEach(handleFetchEventsForClub);
      // console.log("all events: ", events);
  }, [joinedCommunities]);

  const handleFetchEventsForClub = async (clubId: any) => {
    console.log("handleFetchEventsForClub clubId: ", clubId);
    const data = await fetchEventsForClub(clubId);
    setEvents((prevEvents) => {
        const uniqueEvents = new Set(prevEvents.map(event => event.id)); // Set of existing post ids
        const newEvents = data.filter(event => !uniqueEvents.has(event.id)); // Filter out duplicates
        return [...prevEvents, ...newEvents]; // Concatenate new posts with the existing ones
    });
  };
  
  // Update marked dates whenever events change
  useEffect(() => {
    handleRefresh();
    let newMarkedDates: { [key: string]: any } = {};
    events.forEach((event) => {
      newMarkedDates[event.date] = { marked: true, dotColor: "blue" };
    });
    setMarkedDate(newMarkedDates);

    // Refresh selectedDate's events if it is already selected
    if (selectedDate) {
      setSelectedDate(new XDate(selectedDate.toString("yyyy-MM-dd")));
    }
  }, [events]);

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendarContainer}
        minDate={today}
        hideExtraDays={true}
        enableSwipeMonths={true}
        onDayPress={(date) => {
          setSelectedDate(new XDate(date.dateString));
          setMarkedDate((prevMarkedDates) => {
            const updatedMarked = { ...prevMarkedDates };
            // Clear previous selected state
            Object.keys(updatedMarked).forEach((d) => {
              if (updatedMarked[d].selected) {
                delete updatedMarked[d].selected;
                delete updatedMarked[d].selectedColor;
              }
            });
            // Add selection to the clicked date
            updatedMarked[date.dateString] = {
              ...(updatedMarked[date.dateString] || {}),
              selected: true,
              selectedColor: 'blue',
            };
            return updatedMarked;
          });
        }}
        markedDates={markedDate}
      />
      <View style={styles.event}>
        {selectedDate &&(
          <EventList
            key={refreshKey}
            date={selectedDate.toString("yyyy-MM-dd")}
            events={events}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  calendarContainer: {
    borderRadius: 10,
    height: 375,
    width: 300,
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  event: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default CalendarScreen;
