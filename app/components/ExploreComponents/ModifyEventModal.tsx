// import React, { useState } from "react";
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

// interface ModifyEventModalProps {
//   visible: boolean;
//   onClose: () => void;
//   newEventTitle: string;
//   onChangeTitle: (value: string) => void;
//   newEventDate: string;
//   onChangeDate: (value: string) => void;
//   newEventStartTime: string;
//   onChangeStartTime: (value: string) => void;
//   newEventEndTime: string;
//   onChangeEndTime: (value: string) => void;
//   newEventLocation: string;
//   onChangeLocation: (value: string) => void;
//   newEventDescription: string;
//   onChangeDescription: (value: string) => void;
//   onCreate: () => void;
// }

// const ModifyEventModal: React.FC<ModifyEventModalProps> = ({
//   visible,
//   onClose,
//   newEventTitle,
//   onChangeTitle,
//   newEventDate,
//   onChangeDate,
//   newEventStartTime,
//   onChangeStartTime,
//   newEventEndTime,
//   onChangeEndTime,
//   newEventLocation,
//   onChangeLocation,
//   newEventDescription,
//   onChangeDescription,
//   onCreate,
// }) => {
//   const initialDate = newEventDate && !isNaN(Date.parse(newEventDate)) ? new Date(newEventDate) : new Date();
//   const [date, setDate] = useState(initialDate);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [start_time, setStartTime] = useState(new Date());
//   const [end_time, setEndTime] = useState(new Date());


//   const handleDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || date;
//     setShowDatePicker(true);
//     setDate(currentDate);
//     onChangeDate(currentDate.toISOString().split('T')[0]);
//   };

//   const handleTimeStartChange = (event, selectedTime) => {
//     const currentTime = selectedTime || start_time;
//     setStartTime(currentTime);
//     onChangeStartTime(currentTime.toISOString().split('T')[1].substr(0, 8));
//   };

//   const handleTimeEndChange = (event, selectedTime) => {
//     const currentTime = selectedTime || end_time;
//     setEndTime(currentTime);
//     onChangeEndTime(currentTime.toISOString().split('T')[1].substr(0, 8));
//   };

//   if (!visible) return null;

//   return (
//     <View style={styles.modalOverlay}>
//       <View style={styles.modalContainer}>
//         <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
//           <Ionicons name="close" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.modalTitle}>Edit Event</Text>

//         <Text style={styles.modalLabel}>Title:</Text>
//         <TextInput
//           style={styles.modalInput}
//           placeholder="e.g. Book Drive"
//           placeholderTextColor="#aaa"
//           value={newEventTitle}
//           onChangeText={onChangeTitle}
//         />

//         <Text style={styles.modalLabel}>Date:</Text>
//         <View style={styles.pickerContainer}>
//           <DateTimePicker
//             testID="dateTimePicker"
//             value={date}
//             mode="date"
//             display="default"
//             onChange={handleDateChange}
//             maximumDate={new Date(2300, 12, 31)}
//           />
//         </View>

//         <Text style={styles.modalLabel}>Start Time:</Text>
//         <View style={styles.pickerContainer}>
//           <DateTimePicker
//             testID="timePicker"
//             value={start_time}
//             mode="time"
//             display="default"
//             is24Hour={false}
//             onChange={handleTimeStartChange}
//           />
//         </View>

//         <Text style={styles.modalLabel}>End Time:</Text>
//         <View style={styles.pickerContainer}>
//           <DateTimePicker
//             testID="timePicker"
//             value={end_time}
//             mode="time"
//             display="default"
//             is24Hour={false}
//             onChange={handleTimeEndChange}
//           />
//         </View>

//         <Text style={styles.modalLabel}>Location:</Text>
//         <GooglePlacesAutocomplete
//           placeholder="e.g. Gainesville, FL"
//           onPress={(data, details = null) => {
//             onChangeLocation(data.description);
//           }}
//           query={{
//             key: "AIzaSyA5DukSRaMR1oJNR81YxttQsVRmJeFb-Bw",
//             language: 'en',
//           }}
//           fetchDetails={true}
//           styles={{
//             textInput: styles.modalInput,
//             container: { flex: 0 },
//           }}
//         />

//         <Text style={styles.modalLabel}>Description:</Text>
//         <TextInput
//           style={styles.modalInput}
//           placeholder="Describe the event..."
//           placeholderTextColor="#aaa"
//           value={newEventDescription}
//           onChangeText={onChangeDescription}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.createButton} onPress={onCreate}>
//             <Text style={styles.createButtonText}>Save Changes</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   pickerContainer: {
//     width: "100%",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   modalContainer: {
//     backgroundColor: "#000",
//     padding: 20,
//     borderRadius: 10,
//     width: "85%",
//   },
//   modalTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   modalLabel: {
//     color: "#fff",
//     marginBottom: 5,
//   },
//   modalInput: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//     color: "#000",
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   createButton: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     marginTop: 10,
//   },
//   createButtonText: {
//     color: "#000",
//     fontWeight: "bold",
//   },
//   modalCloseButton: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//   },
// });

// export default ModifyEventModal;

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
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
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Edit Event</Text>

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

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Save Changes</Text>
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
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  modalContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    width: "85%",
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
});

export default ModifyEventModal;