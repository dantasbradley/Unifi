import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from 'date-fns';

export interface Event {
  id: string;
  date: string;
  time: string;
  created_at: string;
  datetime: string;
  location: string;
  title: string;
  description: string;
  attending: number;
  clubName: string;
  updateTime: string,
  clubImageUrl: string;
}

interface EventCardProps {
  event: Event;
  isAttending: boolean;
  onToggleAttend: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isAttending, onToggleAttend, onDelete, onEdit }) => {

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
          <Text style={styles.createdAt}>{event.created_at}</Text>
        </View>
      </View>

      <Text style={styles.eventTitle}>{event.title}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={16} color="#aaa" />
        <Text style={styles.metaText}>{event.date}</Text>
        <Text style={styles.metaText}>{event.time}</Text>
        <Text style={styles.metaText}>formatDistanceToNow(new Date(event.updatedTime))</Text>
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
        <TouchableOpacity
          style={[styles.attendButton, isAttending && styles.attending]}
          onPress={onToggleAttend}
        >
          <Text style={[styles.attendText, isAttending && styles.attendingText]}>
            {isAttending ? "Attending" : "Attend"}
          </Text>
        </TouchableOpacity>

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
