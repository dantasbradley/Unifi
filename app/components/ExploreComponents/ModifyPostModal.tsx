import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface ModifyPostModalProps {
  visible: boolean;
  onClose: () => void;
  newPostName: string;
  onChangeName: (value: string) => void;
  newPostContent: string;
  onChangeContent: (value: string) => void;
  onSubmit: (imageUri: string | null) => void;
  existingImageUri?: string | null;
  isEdit?: boolean;
}

const ModifyPostModal: React.FC<ModifyPostModalProps> = ({
  visible,
  onClose,
  newPostName,
  onChangeName,
  newPostContent,
  onChangeContent,
  onSubmit,
  existingImageUri = null,
  isEdit = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (existingImageUri && visible) {
      setSelectedImage(existingImageUri);
    }
  }, [existingImageUri, visible]);

  if (!visible) return null;

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
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = () => {
    onSubmit(selectedImage);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
          <Text style={styles.postButtonText}>{isEdit ? "Save" : "Post"}</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>{isEdit ? "Edit Post" : "Add New Post"}</Text>

        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
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
            <Text style={styles.uploadButtonText}>📷 {selectedImage ? "Change Photo" : "Upload Photo (Optional)"}</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity onPress={handleRemoveImage}>
                <Text style={styles.removeText}>❌ Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  },
  scrollViewContent: {
    paddingBottom: 30,
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
});

export default ModifyPostModal;
