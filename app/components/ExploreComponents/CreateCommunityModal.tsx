import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

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
        <TouchableOpacity style={styles.modalCloseButton} testID='close' onPress={onClose}>
          <Ionicons name="close" size={24} color="#111111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={onCreate}>
          <Text style={styles.postButtonText}>Post</Text>
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
            onChangeLocation(data.description);
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
    alignItems: "stretch",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  modalTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  modalText: {
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

export default CreateCommunityModal;