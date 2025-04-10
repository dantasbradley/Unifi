import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  newPostName: string;
  onChangeName: (value: string) => void;
  newPostContent: string;
  onChangeContent: (value: string) => void;
  onCreate: () => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({
  visible,
  onClose,
  newPostName,
  onChangeName,
  newPostContent,
  onChangeContent,
  onCreate,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
      <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add New Post</Text>

        <Text style={styles.modalLabel}>Title:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="e.g. Group Reading"
          placeholderTextColor="#aaa"
          value={newPostName}
          onChangeText={onChangeName}
        />

        <Text style={styles.modalLabel}>Content:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Describe the event..."
          placeholderTextColor="#aaa"
          value={newPostContent}
          onChangeText={onChangeContent}
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
    justifyContent: "center"
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

export default AddPostModal;
