import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, CalendarList, CalendarUtils } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import XDate from "xdate";
import EventList from "../components/EventList";

const CalendarScreen = () => {

  const today = new XDate().toDateString();

  const [markedDate, setMarkedDate] = useState<MarkedDates | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<XDate | null>(null);
  const [monthEvents, setMonthEvents] = useState({});
  const [selectedEvents, setSelectedEvents] = useState({});

  //Whenever the calendar is loaded in or the user changes the month, we need to check each day to see if they have an event scheduled; if so
  //mark the day on the calendar

  return(
  <View style={styles.container}>
    <Calendar
    style={styles.calendarContainer}
    minDate={new XDate().toDateString()}
    hideExtraDays={true}
    enableSwipeMonths={true}
    onDayPress={(date) => {
      let marked = {[date.dateString]: {selected: true, marked: true, selectedColor: 'blue'}};
      setMarkedDate(marked);
      setSelectedDate(new XDate(date.dateString));
    }}
    onMonthChange={(date) => {
      let marked = {};
      setMarkedDate(marked);
      setSelectedDate(null);
    }}
    markedDates={markedDate}
    />
    <View style={styles.event}>
      {selectedDate !== null ? <EventList date={selectedDate.toDateString()}/> : null}
    </View>
    
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  calendarContainer: {
    borderRadius: 10,
    height: 375,
    width: 300,
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 10
  },
  event: {
    flex: 1,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#000",
  }
});

export default CalendarScreen;
