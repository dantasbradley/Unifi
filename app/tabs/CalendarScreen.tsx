import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, CalendarList, CalendarUtils } from "react-native-calendars";
import XDate from "xdate";

const CalendarScreen = () => {

  const today = new XDate().toDateString();

  const [selectedDate, setSelectedDate] = useState({});
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
      setSelectedDate(marked);
    }}
    markedDates={selectedDate}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000"
  },
  calendarContainer: {
    borderRadius: 10,
    height: 375,
    width: 300
  }
});

export default CalendarScreen;
