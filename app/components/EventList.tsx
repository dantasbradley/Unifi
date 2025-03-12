import React, { useState } from "react";
import { Text, StyleSheet, View, Pressable, FlatList } from "react-native";

interface EventListProps {
    date: string,
    org: string
}

const EventList: React.FC<EventListProps> = ({ date, org }) => {

    //TODO: Make a function to querry the backend for events scheduled at the provided time for the given org

    //This is moreso just a proof of concept
    const events = {};

    return(
        <View>

        </View>
    );
};

export default EventList;