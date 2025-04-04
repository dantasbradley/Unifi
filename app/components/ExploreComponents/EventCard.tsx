import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Event {
  id: string;
  date: string;
  time: string;
  location: string;
  title: string;
  description: string;
  attendees: number;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // tracks if user is attending
  const [isAttending, setIsAttending] = useState(false);

  const handleAttend = () => {
    setIsAttending((prev) => !prev);
  };

  return (
    <View style={styles.eventContainer}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventDate}>
          {event.date} @ {event.time}
        </Text>
        <View style={styles.eventMeta}>
          <Ionicons name="people-outline" size={16} color="#fff" />
          <Text style={styles.eventAttendees}> {event.attendees}</Text>
          <Ionicons name="location-outline" size={16} color="#fff" style={{ marginLeft: 8 }} />
          <Text style={styles.eventLocation}> {event.location}</Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventDescription}>{event.description}</Text>
      <TouchableOpacity style={styles.attendButton} onPress={handleAttend}>
        <Text style={styles.attendButtonText}>
          {isAttending ? "Attending" : "Attend"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  eventContainer: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventDate: {
    color: "#ccc",
    fontSize: 14,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventAttendees: {
    color: "#fff",
  },
  eventLocation: {
    color: "#fff",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  eventDescription: {
    color: "#ccc",
    marginTop: 5,
  },
  attendButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  attendButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default EventCard;
