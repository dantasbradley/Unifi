import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, RefreshControl, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import XDate from "xdate";
import { CommunitiesContext } from "../contexts/CommunitiesContext";
import EventCard, { Event } from "../components/ExploreComponents/EventCard";

const CalendarScreen = () => {
  const today = new XDate().toDateString();

  const [markedDate, setMarkedDate] = useState({});
  const [selectedDate, setSelectedDate] = useState<XDate | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const {
    attendingEvents = new Set(),
    joinedCommunities = new Set(),
    fetchEventsForClub = () => {},
    fetchEvent = () => {},
    toggleAttendEvent = () => {},
  } = useContext(CommunitiesContext) || {};

  useEffect(() => {
    fetchJoinedCommunitiesEvents();
  }, [joinedCommunities]);

  const fetchJoinedCommunitiesEvents = async () => {
    const communityIds = Array.from(joinedCommunities);
    const allEventsArrays = await Promise.all(
      communityIds.map((clubId: string) => fetchEventsForClub(clubId))
    );
    const allEvents = allEventsArrays.flat();
    const uniqueEventMap = new Map();
    allEvents.forEach((event) => {
      if (!uniqueEventMap.has(event.id)) {
        uniqueEventMap.set(event.id, event);
      }
    });
    const uniqueEvents = Array.from(uniqueEventMap.values());
    const sortedEvents = uniqueEvents.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );
    setEvents(sortedEvents);
  };

  const handleRefresh = async () => {
    console.log("Refreshing calendar events");
    setRefreshing(true);
    await fetchJoinedCommunitiesEvents();
    setRefreshKey(Date.now());
    setRefreshing(false);
  };

  useEffect(() => {
    let newMarkedDates: { [key: string]: any } = {};
    events.forEach((event) => {
      newMarkedDates[event.date] = { marked: true, dotColor: "blue" };
    });
    setMarkedDate(newMarkedDates);

    if (selectedDate) {
      setSelectedDate(new XDate(selectedDate.toString("yyyy-MM-dd")));
    }
  }, [events]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toString("yyyy-MM-dd");
      const filtered = events.filter((event) => event.date === dateStr);
      setFilteredEvents(filtered);
    }
  }, [selectedDate, events]);

  useEffect(() => {
    fetchJoinedCommunitiesEvents();
  }, [attendingEvents]);
  

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendarContainer}
        minDate={today}
        hideExtraDays={true}
        enableSwipeMonths={true}
        onDayPress={(date) => {
          const xdate = new XDate(date.dateString);
          setSelectedDate(xdate);

          setMarkedDate((prev) => {
            const updatedMarked = { ...prev };
            Object.keys(updatedMarked).forEach((d) => {
              delete updatedMarked[d].selected;
              delete updatedMarked[d].selectedColor;
            });
            updatedMarked[date.dateString] = {
              ...(updatedMarked[date.dateString] || {}),
              selected: true,
              selectedColor: "blue",
            };
            return updatedMarked;
          });
        }}
        markedDates={markedDate}
      />

      {selectedDate && (
        <View style={styles.eventList}>
          <Text style={styles.dateText}>Events for {selectedDate.toString("yyyy-MM-dd")}</Text>
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                isAttending={attendingEvents.has(item.id)}
                onToggleAttend={() => toggleAttendEvent(item.id)}
                isAdmin={joinedCommunities.has(item.id)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DAD7CD",
    alignItems: "center",
  },
  calendarContainer: {
    borderRadius: 10,
    height: 375,
    width: 300,
    marginTop: 5,
    marginBottom: 10,
  },
  eventList: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#344E41",
    marginBottom: 8,
    alignSelf: "center",
  },
});

export default CalendarScreen;
