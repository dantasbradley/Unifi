import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import CustomButton from "./JoinButton";

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  newCommunityName: string;
  onChangeName: (value: string) => void;
  newCommunityLocation: string;
  onChangeLocation: (value: string) => void;
  onCreate: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  visible,
  onClose,
  newCommunityName,
  onChangeName,
  newCommunityLocation,
  onChangeLocation,
  onCreate,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Create New Community</Text>

        <Text style={styles.modalText}>Name:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Enter community name"
          placeholderTextColor="#aaa"
          value={newCommunityName}
          onChangeText={onChangeName}
        />

        <Text style={styles.modalText}>Location:</Text>
        <GooglePlacesAutocomplete
          placeholder="Enter community location"
          value={newCommunityLocation}
          onChangeText={onChangeLocation}
          onPress={(data, details = null) => {
            // The details parameter contains full information about the selected place.
            onChangeLocation(data.description); // Only the location name is used here.
          }}
          query={{
            key: "AIzaSyA5DukSRaMR1oJNR81YxttQsVRmJeFb-Bw",
            language: "en",
          }}
          fetchDetails={true}
          styles={{
            textInput: styles.modalInput,
            container: { flex: 0, width: "100%" },
          }}
        />

        <View style={styles.modalButtonRow}>
          <CustomButton title="Create" onPress={onCreate} />
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
    alignItems: "center",
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#fff",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  modalInput: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#000",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
});

export default CreateCommunityModal;