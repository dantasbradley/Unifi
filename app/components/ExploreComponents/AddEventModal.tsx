import React, { useState, useRef } from "react";
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, FlatList, 
TouchableWithoutFeedback, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import 'react-native-get-random-values';

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
  const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const googlePlacesRef = useRef(null);

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
    onChangeEndTime(currentTime.toISOString().split("T")[1].substr(0, 8));
  };

  const handleLocationSelect = (data) => {
    onChangeLocation(data.description);
  };

  const handleCreate = () => {
    if (!newEventTitle || !newEventDate || !newEventTime || !newEventLocation || !newEventDescription) {
      alert("Please fill in all the fields before creating the event.");
      return;
    }
    onCreate();
  };

  if (!visible) return null;

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
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Event</Text>

          <FlatList
            data={formFields}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListContent}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
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
    padding: 30,
    borderRadius: 10,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    color: "#fff",
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    color: "#000",
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
  },
  fieldContainer: {
    marginBottom: 15,
  },
  flatListContent: {
    flexGrow: 1,
  },
});

export default AddEventModal;