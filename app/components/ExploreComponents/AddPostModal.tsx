import React, { useState } from "react";
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

// Define the props 
interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  newPostName: string;
  onChangeName: (value: string) => void;
  newPostContent: string;
  onChangeContent: (value: string) => void;
  onCreate: (imageUri: string | null) => void;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Local state for selected image URI

  // Do not render modal if it's not visible
  if (!visible) return null;

  // Open image picker and store selected image URI
  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission is required to access photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Save the selected image URI
    }
  };

  // Remove the selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // Handle post creation and pass selected image URI
  const handleCreate = () => {
    onCreate(selectedImage); // Pass selected image or null to parent
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.postButton} onPress={handleCreate}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Add New Post</Text>

        <View style={styles.scrollViewContent}>
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
            placeholder="Describe the post..."
            placeholderTextColor="#aaa"
            value={newPostContent}
            onChangeText={onChangeContent}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
            <Text style={styles.uploadButtonText}>📷 Upload Photo (Optional)</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity onPress={handleRemoveImage}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: "80%",
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
  uploadButton: {
    backgroundColor: "#E6E6E6",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  uploadButtonText: {
    color: "#1A1A1A",
    textAlign: "center",
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  previewImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
  },
  removeText: {
    color: "#f66",
    fontWeight: "bold",
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
  scrollViewContent: {
    paddingBottom: 5,
  },
});

export default AddPostModal;
