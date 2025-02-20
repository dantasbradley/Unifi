import React, { forwardRef, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface ButtonProps {
    text: string
}

const CheckButton: React.FC<ButtonProps> = ({ text }) => {
    const [selected, setSelected] = useState(false);
    return (
        <View style={styles.button}>
            
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },

});


export default CheckButton;