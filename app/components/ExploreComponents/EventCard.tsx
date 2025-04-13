import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from 'date-fns';

export interface Event {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  datetime: string;
  location: string;
  title: string;
  description: string;
  attending: number;
  clubName: string;
  clubImageUrl: string;
}

interface EventCardProps {
  event: Event;
  isAttending: boolean;
  isAdmin: boolean;
  onToggleAttend: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isAttending, onToggleAttend, onDelete, onEdit, isAdmin }) => {

  const formatEventDateTime = (dateStr: string, startTimeStr: string, endTimeStr: string) => {
    console.log("🕓 Original Inputs => Date:", dateStr, "| Start Time:", startTimeStr, "| End Time:", endTimeStr);
  
    // Parse date parts
    const dateParts = dateStr.split('-').length === 3 ? dateStr.split('-') : dateStr.split('/');
    const [year, month, day] = dateParts.length === 3 && dateParts[0].length === 4
      ? [parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2])]
      : [parseInt(dateParts[2]), parseInt(dateParts[0]), parseInt(dateParts[1])];
  
    // Helper to convert time string and shift
    const convertAndShiftTime = (timeStr: string): string => {
      let [hours, minutes] = timeStr.split(':').map(Number);
      const time = new Date(year, month - 1, day, hours, minutes);
      time.setHours(time.getHours() - 4); // shift 4 hours back
      const h = time.getHours();
      const m = time.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = (h % 12 || 12).toString();
      const formattedMinutes = m.toString().padStart(2, '0');
      return `${formattedHour}:${formattedMinutes} ${ampm}`;
    };
  
    const shiftedStart = convertAndShiftTime(startTimeStr);
    const shiftedEnd = convertAndShiftTime(endTimeStr);
  
    const formattedDate = `${day}/${month}/${year}`;
    const finalString = `${formattedDate} at ${shiftedStart}-${shiftedEnd}`;
  
    console.log("✅ Final Formatted DateTime:", finalString);
    return finalString;
  };


  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {event.clubImageUrl ? (
            <Image source={{ uri: event.clubImageUrl }} style={styles.communityImage} />
        ) : (
            <Text>...</Text>
        )}
        <View>
          <Text style={styles.clubName}>{event.clubName}</Text>
          <Text style={styles.createdAt}>Posted {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</Text>
          {event.updated_at && (
            <Text style={styles.createdAt}>Updated {formatDistanceToNow(new Date(event.updated_at), { addSuffix: true })}</Text>
          )}
        </View>
      </View>

      <Text style={styles.eventTitle}>{event.title}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={16} color="#aaa" />
        <Text style={styles.metaText}>{formatEventDateTime(event.date, event.start_time, event.end_time)}</Text>
        {/* <Text style={styles.metaText}>{event.time}</Text> */}
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={16} color="#aaa" />
        <Text style={styles.metaText}>{event.attending}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={16} color="#aaa" />
        <Text style={styles.metaText}>{event.location}</Text>
      </View>

      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.buttonRow}>
        {isAdmin === false && (
        <TouchableOpacity
          style={[styles.attendButton, isAttending && styles.attending]}
          onPress={onToggleAttend}
          >
          <Text style={[styles.attendText, isAttending && styles.attendingText]}>
            {isAttending ? "Attending" : "Attend"}
          </Text>
        </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}

      </View>
      {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 10,
  },
  createdAt: {
    color: "#888",
    fontSize: 13,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  clubImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 10,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#444",
    marginRight: 10,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#aaa",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  attendButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  attendText: {
    color: "#000",
    fontWeight: "bold",
  },
  attending: {
    backgroundColor: "#4ade80", // green
  },
  attendingText: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#ef4444", // red
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#333",
    padding: 6,
    borderRadius: 6,
  }  
});

export default EventCard;
