import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface ModifyEventModalProps {
  visible: boolean;
  onClose: () => void;
  newEventTitle: string;
  onChangeTitle: (value: string) => void;
  newEventDate: string;
  onChangeDate: (value: string) => void;
  newEventStartTime: string;
  onChangeStartTime: (value: string) => void;
  newEventEndTime: string;
  onChangeEndTime: (value: string) => void;
  newEventLocation: string;
  onChangeLocation: (value: string) => void;
  newEventDescription: string;
  onChangeDescription: (value: string) => void;
  onCreate: () => void;
}

const ModifyEventModal: React.FC<ModifyEventModalProps> = ({
  visible,
  onClose,
  newEventTitle,
  onChangeTitle,
  newEventDate,
  onChangeDate,
  newEventStartTime,
  onChangeStartTime,
  newEventEndTime,
  onChangeEndTime,
  newEventLocation,
  onChangeLocation,
  newEventDescription,
  onChangeDescription,
  onCreate,
}) => {
  const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [start_time, setStartTime] = useState(new Date());
  const [end_time, setEndTime] = useState(new Date());

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(true);
    setDate(currentDate);
    onChangeDate(currentDate.toISOString().split('T')[0]);
  };

  const handleTimeStartChange = (event, selectedTime) => {
    const currentTime = selectedTime || start_time;
    setStartTime(currentTime);
    onChangeStartTime(currentTime.toISOString().split('T')[1].substr(0, 8));
  };

  const handleTimeEndChange = (event, selectedTime) => {
    const currentTime = selectedTime || end_time;
    setEndTime(currentTime);
    onChangeEndTime(currentTime.toISOString().split('T')[1].substr(0, 8));
  };

  const handleCreate = () => {
    console.log({
      newEventTitle,
      newEventDate,
      newEventStartTime,
      newEventEndTime,
      newEventLocation,
      newEventDescription,
    });

    if (!newEventTitle) return Alert.alert("Missing Title", "Please enter a title.");
    if (!newEventDate) return Alert.alert("Missing Date", "Please select a date.");
    if (!newEventStartTime) return Alert.alert("Missing Start Time", "Please select a start time.");
    if (!newEventEndTime) return Alert.alert("Missing End Time", "Please select an end time.");
    if (!newEventLocation) return Alert.alert("Missing Location", "Please select a location.");
    if (!newEventDescription) return Alert.alert("Missing Description", "Please enter a description.");

    onCreate();
  };

  if (!visible) return null;
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalOverlay}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.postButton} onPress={handleCreate}>
            <Text style={styles.postButtonText}>Save</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Edit Event</Text>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            <Text style={styles.modalLabel}>Start Time:</Text>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                testID="timePicker"
                value={start_time}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={handleTimeStartChange}
              />
            </View>

            <Text style={styles.modalLabel}>End Time:</Text>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                testID="timePicker"
                value={end_time}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={handleTimeEndChange}
              />
            </View>

            <Text style={styles.modalLabel}>Location:</Text>
            <GooglePlacesAutocomplete
              placeholder="e.g. Gainesville, FL"
              onPress={(data, details = null) => {
                onChangeLocation(data.description);
              }}
              query={{
                key: "AIzaSyA5DukSRaMR1oJNR81YxttQsVRmJeFb-Bw",
                language: 'en',
              }}
              fetchDetails={true}
              styles={{
                textInput: styles.modalInput,
                container: { flex: 0 },
              }}
            />

            <Text style={styles.modalLabel}>Description:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe the event..."
              placeholderTextColor="#aaa"
              value={newEventDescription}
              onChangeText={onChangeDescription}
            />

          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 30,
    width: "90%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    color: "#1A1A1A",
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: "#1A1A1A",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  postButton: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#588157",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
});

export default ModifyEventModal;