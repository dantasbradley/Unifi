import React, { forwardRef, useState } from "react";
import { Text, StyleSheet, View, Pressable, Image } from "react-native";

interface ButtonProps {
    text: string
}


/* The radio button pngs I found are free and require attribution; may just want to make our own later.
If not, the reference for radio-select.png is : <a href="https://www.flaticon.com/free-icons/radio" title="radio icons">Radio icons created by Bharat Icons - Flaticon</a>
and the reference for radio-deselect.png is: <a href="https://www.flaticon.com/free-icons/radio-button" title="radio button icons">Radio button icons created by Icon mania - Flaticon</a>*/
const CheckButton: React.FC<ButtonProps> = ({ text }) => {
    const [selected, setSelected] = useState(false);
    return (
        <View style={styles.button}>
            <Pressable onPress={() => setSelected(!selected)}>
                <Image style={styles.image} source={selected ? require("../../assets/images/radio-select.png") : require("../../assets/images/radio-deselect.png")}/>
                {text ? <Text style={styles.text}>{text}</Text> : null}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#fff",
        borderRadius: 5,
        justifyContent: "flex-start",
    },
    image: {
        width: 20,
        height: 20,
        marginLeft: 5,
        marginRight: 5
    },
    text: {
        fontSize: 16,
        marginLeft: 5,
        marginRight: 10
    }
});

export default CheckButton;