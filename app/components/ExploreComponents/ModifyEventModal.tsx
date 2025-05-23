import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, KeyboardAvoidingView } from "react-native";
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
  onCreate: (changes: string) => void;
  originalEventTitle: string;
  originalEventDate: string;
  originalEventStartTime: string;
  originalEventEndTime: string;
  originalEventLocation: string;
  originalEventDescription: string;
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
  originalEventTitle,
  originalEventDate,
  originalEventStartTime,
  originalEventEndTime,
  originalEventLocation,
  originalEventDescription,
}) => {
  const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
  const initialStartTime = newEventStartTime ? new Date(`2000-01-01T${newEventStartTime}Z`) : new Date();
  const initialEndTime = newEventEndTime ? new Date(`2000-01-01T${newEventEndTime}Z`) : new Date();
  
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [start_time, setStartTime] = useState(initialStartTime);
  const [end_time, setEndTime] = useState(initialEndTime);

  const formatDateLocal = (date: Date): Date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate() + 1;
    return new Date(year, month, day);
  };
  function addOneHourToDate(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 1);
    return newDate;
  }
  function subtractOneHourToDate(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() - 1);
    return newDate;
  }

  useEffect(() => {
    if (visible){
      setShowDatePicker(true);
      setDate(formatDateLocal(initialDate));
      onChangeDate(initialDate.toISOString().split('T')[0]);

      setStartTime(addOneHourToDate(initialStartTime));
      setEndTime(addOneHourToDate(initialEndTime));
    }
  }, [visible]);

  //format date and time
  const formatEventDateTime = (dateStr: string, startTimeStr: string, endTimeStr: string) => {  
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
  
    const formattedDate = `${month}/${day}/${year}`;
    const finalString = `${formattedDate} at ${shiftedStart}-${shiftedEnd}`;
  
    return finalString;
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(true);
    setDate(currentDate);
    onChangeDate(currentDate.toISOString().split('T')[0]);
  };

  const handleTimeStartChange = (event, selectedTime) => {
    const currentTime = selectedTime || start_time;
    setStartTime(currentTime);
    onChangeStartTime(subtractOneHourToDate(currentTime).toISOString().split('T')[1].substr(0, 8));
  };

  const handleTimeEndChange = (event, selectedTime) => {
    const currentTime = selectedTime || end_time;
    setEndTime(currentTime);
    onChangeEndTime(subtractOneHourToDate(currentTime).toISOString().split('T')[1].substr(0, 8));
  };

  const handleCreate = () => {
    if (!newEventTitle) return Alert.alert("Missing Title", "Please enter a title.");
    if (!newEventDate) return Alert.alert("Missing Date", "Please select a date.");
    if (!newEventStartTime) return Alert.alert("Missing Start Time", "Please select a start time.");
    if (!newEventEndTime) return Alert.alert("Missing End Time", "Please select an end time.");
    if (!newEventLocation) return Alert.alert("Missing Location", "Please select a location.");
    if (!newEventDescription) return Alert.alert("Missing Description", "Please enter a description.");
    const hasChanges =
      newEventTitle !== originalEventTitle ||
      newEventDate !== originalEventDate ||
      newEventStartTime !== originalEventStartTime ||
      newEventEndTime !== originalEventEndTime ||
      newEventLocation !== originalEventLocation ||
      newEventDescription !== originalEventDescription;
    if (!hasChanges) return Alert.alert("No Changes Detected", "Please modify at least one field to save changes.");

    const formattedDateTime = formatEventDateTime(originalEventDate, originalEventStartTime, originalEventEndTime);
    const changes = [];
    if (newEventTitle !== originalEventTitle) {
      changes.push(`Event Title: ${originalEventTitle} → ${newEventTitle}`);
    }
    else {
      changes.push(`Event Title: ${originalEventTitle}`);
    }
    if (newEventDate !== originalEventDate || newEventStartTime !== originalEventStartTime || newEventEndTime !== originalEventEndTime) {
      const newFormattedDateTime = formatEventDateTime(newEventDate, newEventStartTime, newEventEndTime);
      changes.push(`\nWhen: ${formattedDateTime} → ${newFormattedDateTime}`);
    }
    else {
      changes.push(`\nWhen: ${formattedDateTime}`);
    }
    if (newEventLocation !== originalEventLocation) 
      changes.push(`\nLocation: ${originalEventLocation} → ${newEventLocation}`);
    if (newEventDescription !== originalEventDescription) 
      changes.push(`\nDescription Changed`);
    onCreate(changes.join(''));
    onClose();
  };

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

          {/* Date Picker */}
          <View style={{ marginBottom: 20 }}>
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
          </View>

          {/* Start Time Picker */}
          <View style={{ marginBottom: 20 }}>
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
          </View>

          {/* End Time Picker */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.modalLabel}>End Time:</Text>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                testID="timePicker"
                value={end_time}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={handleTimeEndChange}
                minimumDate={new Date(2000, 0, 0, 0, 0)}
                maximumDate={new Date(2000, 0, 12, 23, 59)}
              />
            </View>
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
  scrollContainer: {
    paddingBottom: 60,
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

export default ModifyEventModal;