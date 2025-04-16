import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
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
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>{isEdit ? "Edit Post" : "Add New Post"}</Text>

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

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
            <Text style={styles.createButtonText}>{isEdit ? "Update" : "Create"}</Text>
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
  uploadButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  uploadButtonText: {
    color: "#fff",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
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

export default ModifyPostModal;
