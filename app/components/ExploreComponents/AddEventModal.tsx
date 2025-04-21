import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";

// Props interface for the AddEventModal
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
  // Set initial date based on existing value or use today
  const initialDate =
    newEventDate && !isNaN(Date.parse(newEventDate))
      ? new Date(newEventDate)
      : new Date();

  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const googlePlacesRef = useRef(null);

  // Handle selecting date
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onChangeDate(currentDate.toISOString().split("T")[0]);
  };

  // Handle selecting start time
  const handleStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setStartTime(currentTime);
    onChangeStartTime(currentTime.toISOString().split("T")[1].substr(0, 8));
  };

  // Handle selecting end time
  const handleEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setEndTime(currentTime);
    onChangeEndTime(currentTime.toISOString().split("T")[1].substr(0, 8));
  };

  // Handle location selection from Google Places
  const handleLocationSelect = (data) => {
    onChangeLocation(data.description);
  };

  // Validate form and call onCreate if valid
  const handleCreate = () => {
    if (
      !newEventTitle ||
      !newEventDate ||
      !newEventStartTime ||
      !newEventEndTime ||
      !newEventLocation ||
      !newEventDescription
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all the fields before creating the event."
      );
      return;
    }

    const start = new Date(`${newEventDate}T${newEventStartTime}`);
    const end = new Date(`${newEventDate}T${newEventEndTime}`);

    if (end <= start) {
      Alert.alert("Invalid End Time", "End time must be after start time.");
      return;
    }

    onCreate();
  };

  // If modal is not visible, render nothing
  if (!visible) return null;

  // Define all form fields with either input or custom components
  const formFields = [
    {
      id: "title",
      label: "Title",
      value: newEventTitle,
      onChangeText: onChangeTitle,
      placeholder: "e.g. Book Drive",
    },
    {
      id: "date",
      label: "Date",
      component: (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2300, 12, 31)}
        />
      ),
    },
    {
      id: "start_time",
      label: "Start Time",
      component: (
        <DateTimePicker
          testID="timePicker"
          value={startTime}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleStartTimeChange}
        />
      ),
    },
    {
      id: "end_time",
      label: "End Time",
      component: (
        <DateTimePicker
          testID="timePicker"
          value={endTime}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleEndTimeChange}
        />
      ),
    },
    {
      id: "location",
      label: "Location",
      component: (
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
            textInput: {
              ...styles.modalInput,
              placeholderTextColor: "#aaa",
            },
            listView: { backgroundColor: "#fff", zIndex: 1000 },
          }}
          debounce={300}
        />
      ),
    },
    {
      id: "description",
      label: "Description",
      value: newEventDescription,
      onChangeText: onChangeDescription,
      placeholder: "Describe the event...",
    },
  ];

  // Render either input field or component
  const renderItem = ({ item }) => {
    if (item.component) {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.modalLabel}>{item.label}:</Text>
          {item.component}
        </View>
      );
    }
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.modalLabel}>{item.label}:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder={item.placeholder}
          placeholderTextColor="#aaa"
          value={item.value}
          onChangeText={item.onChangeText}
        />
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          {/* Close Modal Button */}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#111111" />
          </TouchableOpacity>

          {/* Post Button */}
          <TouchableOpacity style={styles.postButton} onPress={handleCreate}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>

          {/* Modal Title */}
          <Text style={styles.modalTitle}>Add New Event</Text>

          {/* Render All Form Fields */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {formFields.map((field) => (
              <React.Fragment key={field.id}>
                {renderItem({ item: field })}
              </React.Fragment>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles
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
    padding: 30,
    borderRadius: 16,
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
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
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
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
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
  fieldContainer: {
    marginBottom: 15,
  },
  flatListContent: {
    flexGrow: 1,
  },
  scrollContainer: {
    paddingBottom: 130,
  },
});

export default AddEventModal;