import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ImageSourcePropType} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import EventCard, { Event } from "../../components/ExploreComponents/EventCard";
import PostCard, { Post } from "../../components/ExploreComponents/PostCard";
import AddEventModal from "../../components/ExploreComponents/AddEventModal";
import AddPostModal from "../../components/ExploreComponents/AddPostModal";
import EditToggleButton from "../../components/ExploreComponents/EditToggleButton";

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

  // State for Bio editing
  const [editMode, setEditMode] = useState(false);
  const [bioDescription, setBioDescription] = useState("We are a group that loves to read, meet up, etc.");
  const [email, setEmail] = useState("example@gmail.com");
  const [insta, setInsta] = useState("@insertHandle");
 
  const [profileImage, setProfileImage] = useState<ImageSourcePropType>(placeholderImage);

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

  // Return white color if tab is active, else gray
  const getTabColor = (tabName: string) => (activeTab === tabName ? "#fff" : "#999");

  // Toggle edit mode and save changes when toggling off
  const toggleEditMode = () => {
    // TODO: Add saving logic here before exiting edit mode
    setEditMode((prev) => !prev);
  };

  const handleChangeImage = async () => {
    if (!editMode) return;
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access your media library to change the image.");
      return;
    }
    // Open the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, 
    });
    // If the user didn't cancel, update the profile image state
    if (!result.canceled && result.assets.length > 0) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Community Name in Header */}
        <Text style={styles.headerTitle}>{name}</Text>

        {/* Tabs Row (Bio, Events, Community) */}
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

      {/* Main Content */}
      <View style={styles.contentArea}>
        {activeTab === "Bio" && (
          <View>
            {/* Bio Header with Edit Button */}
            <View style={styles.bioHeader}>
              <EditToggleButton 
                editMode={editMode}
                onPress={toggleEditMode}
                style={styles.editButton}
              />
            </View>

            {/* Profile Image */}
            <TouchableOpacity onPress={handleChangeImage}>
              <Image source={profileImage} style={styles.largeImage} />
              {editMode && <Text style={styles.changeImageText}>Change Image</Text>}
            </TouchableOpacity>

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            {editMode ? (
              <TextInput
                style={[styles.sectionText, styles.input]}
                value={bioDescription}
                onChangeText={setBioDescription}
                multiline
              />
            ) : (
              <Text style={styles.sectionText}>{bioDescription}</Text>
            )}

            {/* Contact Information */}
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {editMode ? (
              <>
                <TextInput
                  style={[styles.sectionText, styles.input]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={[styles.sectionText, styles.input]}
                  value={insta}
                  onChangeText={setInsta}
                  placeholder="Instagram"
                  placeholderTextColor="#aaa"
                />
              </>
            ) : (
              <>
                <Text style={styles.sectionText}>Email: {email}</Text>
                <Text style={styles.sectionText}>Insta: {insta}</Text>
              </>
            )}
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

            {/* Plus button to add event */}
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

            {/* Plus button to add post */}
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
  bioHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
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
  input: {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  changeImageText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
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
