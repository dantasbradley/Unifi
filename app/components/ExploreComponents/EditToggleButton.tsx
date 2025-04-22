import React from "react";
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EditToggleButtonProps {
  editMode: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function EditToggleButton({ editMode, onPress, style }: EditToggleButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {/* Swap icons based on editMode */}
      <Ionicons name={editMode ? "checkmark" : "create"} size={24} color="#344E41" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  borderColor: "#344E41",
  },
});
