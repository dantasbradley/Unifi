import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"; // Google Places input
import 'react-native-get-random-values'; //Google needs this

// Define props 
interface AddEventModalProps {
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

// Functional component 
const AddEventModal: React.FC<AddEventModalProps> = ({
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
  // Set initial state values or default to current date
  const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const googlePlacesRef = useRef(null);

  // When modal becomes visible, sync local state with props
  useEffect(() => {
    if (visible){
      const currentDate = date;
      setDate(currentDate);
      onChangeDate(currentDate.toISOString().split("T")[0]);

      const currentStartTime = startTime;
      setStartTime(currentStartTime);
      onChangeStartTime(currentStartTime.toISOString().split("T")[1].substr(0, 8));
    }
  }, [visible]);

  // Handlers for date and time pickers
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onChangeDate(currentDate.toISOString().split("T")[0]);
  };

  const handleStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setStartTime(currentTime);
    onChangeStartTime(currentTime.toISOString().split("T")[1].substr(0, 8));
  };

  const handleEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setEndTime(currentTime);
    const adjustedTime = new Date(currentTime);
    adjustedTime.setHours(adjustedTime.getHours() - 1);
    onChangeEndTime(adjustedTime.toISOString().split("T")[1].substr(0, 8));
  };

  // Handle location selection from autocomplete
  const handleLocationSelect = (data) => {
    onChangeLocation(data.description);
  };

  // Validate fields before creating event
  const handleCreate = () => {
    const missingFields = [];
    if (!newEventTitle) missingFields.push("Title");
    if (!newEventDate) missingFields.push("Date");
    if (!newEventStartTime) missingFields.push("Start Time");
    if (!newEventEndTime) missingFields.push("End Time");
    if (!newEventLocation) missingFields.push("Location");
    if (!newEventDescription) missingFields.push("Description");

    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Fields",
        `Please fill in the following field(s): ${missingFields.join(", ")}.`
      );
      return;
    }
    onCreate();
  };


  // Do not render modal if it's not visible
  if (!visible) return null;

  // Define the form fields to render
  const formFields = [
    { id: "title", label: "Title", value: newEventTitle, onChangeText: onChangeTitle, placeholder: "e.g. Book Drive" },
    { id: "date", label: "Date", component: (
      <DateTimePicker
        testID="dateTimePicker"
        value={date}
        mode="date"
        display="default"
        onChange={handleDateChange}
        maximumDate={new Date(2300, 12, 31)}
      />
    )},
    { id: "start_time", label: "Start Time", component: (
      <DateTimePicker
        testID="timePicker"
        value={startTime}
        mode="time"
        display="default"
        is24Hour={false}
        onChange={handleStartTimeChange}
      />
    )},
    { id: "end_time", label: "End Time", component: (
      <DateTimePicker
        testID="timePicker"
        value={endTime}
        mode="time"
        display="default"
        is24Hour={false}
        onChange={handleEndTimeChange}
        minimumDate={new Date(2000, 0, 1, 0, 0)}
        maximumDate={new Date(2000, 0, 1, 23, 59)}
      />
    )},
    { id: "location", label: "Location", component: (
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder="e.g. Gainesville, FL"
        onPress={handleLocationSelect}
        query={{
          key: "AIzaSyA5DukSRaMR1oJNR81YxttQsVRmJeFb-Bw",
          language: "en",
          types: "geocode",
        }}
        fetchDetails={true}
        styles={{
          textInput: styles.modalInput,
          listView: { backgroundColor: "#fff", zIndex: 1000 },
        }}
        debounce={300}
      />
    )},
    { id: "description", label: "Description", value: newEventDescription, onChangeText: onChangeDescription, placeholder: "Describe the event..." },
  ];

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
      >
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#111111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={handleCreate}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add New Event</Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {formFields.map((field) => (
            <View style={styles.fieldContainer} key={field.id}>
              <Text style={styles.modalLabel}>{field.label}:</Text>
              {field.component ? (
                field.component
              ) : (
                <TextInput
                  style={styles.modalInput}
                  placeholder={field.placeholder}
                  placeholderTextColor="#aaa"
                  value={field.value}
                  onChangeText={field.onChangeText}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 30,
    width: "95%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "stretch",
  },
  modalTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  modalLabel: {
    color: "#1A1A1A",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  modalInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: "#1A1A1A",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  // New styles for CreateCommunityModal visual match
  scrollContainer: {
    paddingBottom: 20,
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
});

export default AddEventModal;