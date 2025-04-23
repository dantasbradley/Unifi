import React, { forwardRef } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

//button text label and onPress handler
interface ButtonProps {
  title: string;
  onPress: () => void;
}

//forwardRef to work with link wrappers
const CustomButton: React.FC<ButtonProps> = forwardRef<any, ButtonProps>(({ title, onPress }, ref) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
));
CustomButton.displayName = "CustomButton"; 

//button styling
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CustomButton;
