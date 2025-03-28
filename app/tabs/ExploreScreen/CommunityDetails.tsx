import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import EventCard, { Event } from "../../components/ExploreComponents/EventCard";
import PostCard, { Post } from "../../components/ExploreComponents/PostCard";
import AddEventModal from "../../components/ExploreComponents/AddEventModal";
import AddPostModal from "../../components/ExploreComponents/AddPostModal";

const placeholderImage = require("../../../assets/images/placeholder.png");

const initialEvents: Event[] = [
  {
    id: "1",
    date: "02/28/2025",
    time: "4pm",
    location: "Gainesville, FL",
    title: "Weekly book organizing",
    description: "Sort new books into the correct area",
    attendees: 5,
  },
];

const initialPosts: Post[] = [
  {
    id: "1",
    name: "Group Reading",
    time: "10h",
    content: "Last Tuesday, we had a huge turnout!",
    likes: 2,
    comments: 0,
  },
];

export default function CommunityDetailsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"Bio" | "Events" | "Community">("Bio");

  // Events state
  const [events, setEvents] = useState(initialEvents);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");

  const handleCreateEvent = () => {
    const newId = (events.length + 1).toString();
    const newEvent: Event = {
      id: newId,
      date: newEventDate || "TBD",
      time: newEventTime || "TBD",
      location: newEventLocation || "TBD",
      title: newEventTitle || "New Event",
      description: newEventDescription || "No description provided.",
      attendees: 0,
    };

    setEvents([...events, newEvent]);
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
    setNewEventDescription("");
    setEventModalVisible(false);
  };

  // Community posts state
  const [communityPosts, setCommunityPosts] = useState(initialPosts);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostName, setNewPostName] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = () => {
    const newId = (communityPosts.length + 1).toString();
    const newPost: Post = {
      id: newId,
      name: newPostName || "Unnamed Group",
      time: "0h",
      content: newPostContent || "No content",
      likes: 0,
      comments: 0,
    };

    setCommunityPosts([...communityPosts, newPost]);
    setNewPostName("");
    setNewPostContent("");
    setPostModalVisible(false);
  };

  const getTabColor = (tabName: string) => (activeTab === tabName ? "#fff" : "#999");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{name}</Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab("Bio")} style={styles.tabButton}>
            <Text style={[styles.tabText, { color: getTabColor("Bio") }]}>Bio</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("Events")} style={styles.tabButton}>
            <Text style={[styles.tabText, { color: getTabColor("Events") }]}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("Community")} style={styles.tabButton}>
            <Text style={[styles.tabText, { color: getTabColor("Community") }]}>Community</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentArea}>
        {activeTab === "Bio" && (
          <View>
            <Image source={placeholderImage} style={styles.largeImage} />
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>
              We are a group that loves to read, meet up, etc.
            </Text>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionText}>Email: example@gmail.com</Text>
            <Text style={styles.sectionText}>Insta: @insertHandle</Text>
          </View>
        )}

        {activeTab === "Events" && (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Events</Text>
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <EventCard event={item} />}
              style={{ marginTop: 10 }}
            />

            <AddEventModal
              visible={eventModalVisible}
              onClose={() => setEventModalVisible(false)}
              newEventTitle={newEventTitle}
              onChangeTitle={setNewEventTitle}
              newEventDate={newEventDate}
              onChangeDate={setNewEventDate}
              newEventTime={newEventTime}
              onChangeTime={setNewEventTime}
              newEventLocation={newEventLocation}
              onChangeLocation={setNewEventLocation}
              newEventDescription={newEventDescription}
              onChangeDescription={setNewEventDescription}
              onCreate={handleCreateEvent}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setEventModalVisible(true)}>
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "Community" && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={communityPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PostCard post={item} />}
              style={{ marginTop: 10 }}
            />

            <AddPostModal
              visible={postModalVisible}
              onClose={() => setPostModalVisible(false)}
              newPostName={newPostName}
              onChangeName={setNewPostName}
              newPostContent={newPostContent}
              onChangeContent={setNewPostContent}
              onCreate={handleCreatePost}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setPostModalVisible(true)}>
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  tabsRow: {
    flexDirection: "row",
  },
  tabButton: {
    marginLeft: 15,
  },
  tabText: {
    fontSize: 14,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  largeImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionText: {
    color: "#fff",
    marginBottom: 15,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
