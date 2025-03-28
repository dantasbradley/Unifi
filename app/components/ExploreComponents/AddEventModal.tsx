import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  newEventTitle: string;
  onChangeTitle: (value: string) => void;
  newEventDate: string;
  onChangeDate: (value: string) => void;
  newEventTime: string;
  onChangeTime: (value: string) => void;
  newEventLocation: string;
  onChangeLocation: (value: string) => void;
  newEventDescription: string;
  onChangeDescription: (value: string) => void;
  onCreate: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  newEventTitle,
  onChangeTitle,
  newEventDate,
  onChangeDate,
  newEventTime,
  onChangeTime,
  newEventLocation,
  onChangeLocation,
  newEventDescription,
  onChangeDescription,
  onCreate,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Add New Event</Text>

        <Text style={styles.modalLabel}>Title:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Book Drive"
          placeholderTextColor="#aaa"
          value={newEventTitle}
          onChangeText={onChangeTitle}
        />

        <Text style={styles.modalLabel}>Date:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. 02/28/2025"
          placeholderTextColor="#aaa"
          value={newEventDate}
          onChangeText={onChangeDate}
        />

        <Text style={styles.modalLabel}>Time:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. 4pm"
          placeholderTextColor="#aaa"
          value={newEventTime}
          onChangeText={onChangeTime}
        />

        <Text style={styles.modalLabel}>Location:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Gainesville, FL"
          placeholderTextColor="#aaa"
          value={newEventLocation}
          onChangeText={onChangeLocation}
        />

        <Text style={styles.modalLabel}>Description:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Describe the event..."
          placeholderTextColor="#aaa"
          value={newEventDescription}
          onChangeText={onChangeDescription}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.createButton} onPress={onCreate}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: "#444" }]}
            onPress={onClose}
          >
            <Text style={styles.createButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalLabel: {
    color: "#fff",
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  createButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  createButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default AddEventModal;
