import React, { forwardRef } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  testID?: string
}

//I believe forwardRef is needed to keep Link happy when we use asChild since it expects that the component it's wrapping will use this func,
//however, even without it still seems to run fine
const CustomButton: React.FC<ButtonProps> = forwardRef<any, ButtonProps>(({ title, onPress, testID = undefined}, ref) => (
  <TouchableOpacity style={styles.button} onPress={onPress} testID={testID}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
));
CustomButton.displayName = "CustomButton";

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
