import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());  // Use current time as initial state or parse newEventTime if it's provided.

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(true);
    setDate(currentDate);
    onChangeDate(currentDate.toISOString().split('T')[0]);  // Format the date to YYYY-MM-DD
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setTime(currentTime);
    onChangeTime(currentTime.toISOString().split('T')[1].substr(0, 8)); // Format the time to HH:mm:ss
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
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
        <View style={styles.pickerContainer}>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2300, 12, 31)}
        />
        </View>

        <Text style={styles.modalLabel}>Time:</Text>
        <View style={styles.pickerContainer}></View>
        <View style={styles.pickerContainer}>
        <DateTimePicker
          testID="timePicker"
          value={time}
          mode="time"
          display="default"
          is24Hour={false}  // Optional: change this based on your locale preferences
          onChange={handleTimeChange}
        />
        </View>

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
  pickerContainer: {
    width: "100%",  // Take full width of the modal container
    alignItems: "center",  // Center align the date and time pickers
    marginBottom: 20,
  },
  modalText: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "#000",
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
  dateText: {
    color: "#000",
  },
  calendarIcon: {
    color: "#000", // Adjust this color as needed
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
  }
});

export default AddEventModal;
