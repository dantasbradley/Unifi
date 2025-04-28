import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, RefreshControl, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import EventCard, { Event } from "../../components/ExploreComponents/EventCard";
import PostCard, { Post } from "../../components/ExploreComponents/PostCard";
import AddEventModal from "../../components/ExploreComponents/AddEventModal";
import AddPostModal from "../../components/ExploreComponents/AddPostModal";
import EditToggleButton from "../../components/ExploreComponents/EditToggleButton";
import ModifyPostModal from "../../components/ExploreComponents/ModifyPostModal";
import ModifyEventModal from "../../components/ExploreComponents/ModifyEventModal";
import { CommunitiesContext } from "../../contexts/CommunitiesContext";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import 'react-native-get-random-values';

export default function CommunityDetailsScreen() {
  const router = useRouter();
  const { id, name, isAdmin, startTab} = useLocalSearchParams();

  const {
    likedPosts = new Set(),
    attendingEvents = new Set(),
    toggleLikePost = () => {},
    toggleAttendEvent = () => {},
    fetchClubAttribute = () => {},
    updateClubAttribute = () => {},
    fetchPostsForClub = () => {},
    fetchEventsForClub = () => {},
    fetchClubImage = () => {},
    fetchPostImage = () => {},
    uploadImage = () => {},
  } = useContext(CommunitiesContext) || {};

  const [activeTab, setActiveTab] = useState<"Bio" | "Events" | "Community">("Bio");
  const [refreshingEvents, setRefreshingEvents] = useState(false);
  const [refreshingPosts, setRefreshingPosts] = useState(false);

  // Bio
  const [editMode, setEditMode] = useState(false);
  const [originalBioDescription, setOriginalBioDescription] = useState("");
  const [bioDescription, setBioDescription] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [email, setEmail] = useState("");  
  const [originalInsta, setOriginalInsta] = useState("");
  const [insta, setInsta] = useState("");
  const [originalLocation, setOriginalLocation] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const googlePlacesRef = useRef(null);

  // Events
  const [events, setEvents] = useState([]);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  // edit Events
  const [editEventModalVisible, setEditEventModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventStartTime, setEditEventStartTime] = useState("");
  const [editEventEndTime, setEditEventEndTime] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventDescription, setEditEventDescription] = useState("");
  const [originalEventTitle, setOriginalEventTitle] = useState("");
  const [originalEventDate, setOriginalEventDate] = useState("");
  const [originalEventStartTime, setOriginalEventStartTime] = useState("");
  const [originalEventEndTime, setOriginalEventEndTime] = useState("");
  const [originalEventLocation, setOriginalEventLocation] = useState("");
  const [originalEventDescription, setOriginalEventDescription] = useState("");
  const [hideAddButton, setHideAddButton] = useState(false);

  // Posts
  const [communityPosts, setCommunityPosts] = useState([]);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostName, setNewPostName] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [hidePostAddButton, setHidePostAddButton] = useState(false);

  const [editPostModalVisible, setEditPostModalVisible] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostImageUri, setEditPostImageUri] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  //refreshes
  const handleRefreshEvents = async () => {
    setRefreshingEvents(true);
    try {
      await handleFetchEventsForClub(id);
    } catch (error) {
      console.error("Error refreshing events:", error);
    }
    setRefreshingEvents(false);
  };
  const handleRefreshPosts = async () => {
    setRefreshingPosts(true);
    try {
      await handleFetchPostsForClub(id);
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
    setRefreshingPosts(false);
  };
  // Fetch posts and events when the component mounts
  useEffect(() => {
    handleFetchPostsForClub(id);
    handleFetchEventsForClub(id);
  }, []);
  // Fetch posts or events when the likedPosts or attendingEvents change
  useEffect(() => {
    handleFetchPostsForClub(id);
  }, [likedPosts]);
  useEffect(() => {
    handleFetchEventsForClub(id);
  }, [attendingEvents]);
  // Fetch posts and events function
  const handleFetchPostsForClub = async (clubId: any) => {
    const data = await fetchPostsForClub(clubId);
    const sortedPosts = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setCommunityPosts(sortedPosts);
  };
  
  const handleFetchEventsForClub = async (clubId: any) => {
    const data = await fetchEventsForClub(clubId);
    // Sort events by datetime (newest first)
    const sortedEvents = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setEvents(sortedEvents);
  };
  // Set initial values for bio fields
  useEffect(() => {
    if (!id || !name) return;

    console.log("Navigated to new community with id:", id);

    setActiveTab(startTab as "Bio" | "Events" | "Community");
    handleFetchClubImage(`club_profile_pics/${id}_${name}`);
    loadClubAttribute(id, "description", setBioDescription, setOriginalBioDescription);
    loadClubAttribute(id, "email", setEmail, setOriginalEmail);
    loadClubAttribute(id, "instagram", setInsta, setOriginalInsta);
    loadClubAttribute(id, "location", setLocation, setOriginalLocation); 

    handleFetchPostsForClub(id);
    handleFetchEventsForClub(id);

  }, [id, name]);
  // Fetch club attributes
  const loadClubAttribute = async (
    clubId: string,
    field: string,
    setValue: (value: string) => void,
    setOriginalValue: (value: string) => void
  ) => {
    const attribute = await fetchClubAttribute(clubId, field);
    if (attribute) {
      setValue(attribute);
      setOriginalValue(attribute);
    }
  };
  const handleFetchClubImage = async (filePath : any) => {
    const imageUrl = await fetchClubImage(`club_profile_pics/${id}_${name}`);
    setImageUrl(imageUrl); 
  };
  
  const getTabColor = (tabName: string) => (activeTab === tabName ? "#fff" : "#999");
  // Toggle edit mode and save changes when toggling off
  const toggleEditMode = () => {
    if (editMode) {
      handleSave();
    }
    setEditMode((prev) => !prev);
  };
  const handleSave = () => {
    console.log("Saving changes...");
    saveIfChanged(id, "description", bioDescription, originalBioDescription, setOriginalBioDescription);
    saveIfChanged(id, "email", email, originalEmail, setOriginalEmail);
    saveIfChanged(id, "instagram", insta, originalInsta, setOriginalInsta);
    saveIfChanged(id, "location", location, originalLocation, setOriginalLocation);
  };
  const saveIfChanged = (
    clubId: string, 
    field: string, 
    newValue: string, 
    originalValue: string, 
    setOriginalValue: (value: string) => void
  ) => {
    if (newValue !== originalValue) {
      updateClubAttribute(clubId, field, newValue);
      setOriginalValue(newValue);
    } else {
      console.log(`No changes detected in ${field}.`);
    }
  };

  const uploadClubImage = async (filePath : any, imageUri : any) => {
    try {
        console.log("filePath: ", filePath);
        const response = await fetch(`http://3.85.25.255:3000/S3/get/upload-signed-url?filePath=${encodeURIComponent(filePath)}`);
        const { url } = await response.json();
        const blob = await (await fetch(imageUri)).blob();
        // Use the pre-signed URL to upload the blob
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: blob,
        });
        await handleFetchClubImage(`club_profile_pics/${id}_${name}`);
    } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Upload failed!');
    }
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,  // Consider whether you need the base64 encoding now
    });

    if (!result.canceled) {
        uploadClubImage(`club_profile_pics/${id}_${name}`, result.assets[0].uri);
    }
  };

  //format date and time
  const formatEventDateTime = (dateStr: string, startTimeStr: string, endTimeStr: string) => {
    // console.log("Original Inputs => Date:", dateStr, "| Start Time:", startTimeStr, "| End Time:", endTimeStr);
  
    // Parse date parts
    const dateParts = dateStr.split('-').length === 3 ? dateStr.split('-') : dateStr.split('/');
    const [year, month, day] = dateParts.length === 3 && dateParts[0].length === 4
      ? [parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2])]
      : [parseInt(dateParts[2]), parseInt(dateParts[0]), parseInt(dateParts[1])];
  
    // Helper to convert time string and shift
    const convertAndShiftTime = (timeStr: string): string => {
      let [hours, minutes] = timeStr.split(':').map(Number);
      const time = new Date(year, month - 1, day, hours, minutes);
      time.setHours(time.getHours() - 4); // shift 4 hours back
      const h = time.getHours();
      const m = time.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = (h % 12 || 12).toString();
      const formattedMinutes = m.toString().padStart(2, '0');
      return `${formattedHour}:${formattedMinutes} ${ampm}`;
    };
  
    const shiftedStart = convertAndShiftTime(startTimeStr);
    const shiftedEnd = convertAndShiftTime(endTimeStr);
  
    const formattedDate = `${month}/${day}/${year}`;
    const finalString = `${formattedDate} at ${shiftedStart}-${shiftedEnd}`;
  
    // console.log("Final Formatted DateTime:", finalString);
    return finalString;
  };
  const formatToAmPm = (timeStr: string) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute || 0);
    const hours = date.getHours();
    const formattedHour = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinutes} ${ampm}`;
  };
  //create notification, event, and post
  const handleCreateNotification = async (eventTitle: string, changeType: string) => {
    if (!eventTitle || !changeType) {
      console.log("Missing title or change type.");
      return;
    }
  
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/notifications/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          type: changeType,
          club_id: id,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error("Failed to create notification");
      setHidePostAddButton(false);
      console.log(`Notification created as ${changeType}:\n${eventTitle}`);
    } catch (error) {
      console.error("Error creating notification:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };
  const handleCreatePost = async (imageUri: string | null) => {
    // if (!newPostName || !newPostContent) {
    //     Alert.alert("Error", "Title and content are required.");
    //     return;
    // }
    console.log("newPostName" , newPostName);

    try {
        let filePath = "";
        const newImageUri = imageUri ? imageUri : "";
        const response = await fetch("http://3.85.25.255:3000/DB/posts/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newPostName,
                content: newPostContent,
                filePath,
                club_id: id,
                imageUri: newImageUri,
            }),
        });
        const data = await response.json();

        if (response.ok) {
            console.log("Message result:", data.message);
            if (imageUri) {
              console.log("uploading image: ", data.filePath);
              await uploadImage(data.filePath, imageUri);
            }
            await handleRefreshPosts();
            setPostModalVisible(false);
            setHidePostAddButton(false);
            setNewPostName("");
            setNewPostContent("");
        } else {
            Alert.alert("Error", data.message || "Failed to create post.");
        }
    } catch (error) {
        console.error("Error creating post:", error);
        Alert.alert("Error", "Could not connect to server.");
    }
  };
  const handleCreateEvent = async () => {
    if (!newEventTitle || !newEventDate || !newEventStartTime || !newEventEndTime || !newEventLocation || !newEventDescription) {
      Alert.alert("Error", "All fields are required to create an event.");
      return;
    }
  
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/events/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle,
          date: newEventDate,
          start_time: newEventStartTime,
          end_time: newEventEndTime,
          location: newEventLocation,
          description: newEventDescription,
          club_id: id,
        }),
      });
      const data = await response.json();
  
      if (response.ok) {
        await handleRefreshEvents();
        setEventModalVisible(false);
        setHideAddButton(false);
        console.log("Event created successfully");
        setNewEventTitle("");
        setNewEventDate("");
        setNewEventStartTime("");
        setNewEventEndTime("");
        setNewEventLocation("");
        setNewEventDescription("");
  
        const datetime = formatEventDateTime(newEventDate, newEventStartTime, newEventEndTime);
        const createMessage = `Event title: ${newEventTitle} \nWhen: ${datetime}`;
        handleCreateNotification(createMessage, "Event Created");
      } else {
        Alert.alert("Error", data.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };
  // Handle edit post and event
  const handleEditPost = async (postId, updatedTitle, updatedContent, imageUri: string | null) => {  
    try {
      let filePath = "";
      const newImageUri = imageUri ? imageUri : "";
      const response = await fetch(`http://3.85.25.255:3000/DB/posts/update/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
          filePath, 
          imageUri: newImageUri,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to update post");

      if (imageUri) {
        console.log("uploading image: ", data.filePath);
        await uploadImage(data.filePath, imageUri);
      }
      await handleRefreshPosts();
      console.log("Edit post success");
      setEditPostModalVisible(false);
      setHidePostAddButton(false);
    } catch (error) {
      console.error("Error editing post:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };
  const handleEditEvent = async (eventId, updatedTitle, updatedDate, updatedStartTime, updatedEndTime, updatedLocation, updatedDescription, changes: string) => {
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/events/update/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          date: updatedDate,
          start_time: updatedStartTime,
          end_time: updatedEndTime,
          location: updatedLocation,
          description: updatedDescription,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to update event");

      await handleRefreshEvents();
      setEditEventModalVisible(false);
      handleCreateNotification(changes, "Event Updated");

    } catch (error) {
      console.error("Error editing event:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };  
  // Handle deletes
  const handleDeleteClub = async () => {
    Alert.alert(
      "Delete Club",
      `Are you sure you want to permanently delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const encodedPfpPath = encodeURIComponent(`club_profile_pics/${id}_${name}`);
              const response = await fetch(`http://3.85.25.255:3000/DB/clubs/delete/${id}?clubPfpPath=${encodedPfpPath}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (response.ok) {
                router.replace("/tabs/ExploreScreen");
              } else {
                Alert.alert("Error", result.message || "Failed to delete club.");
              }
            } catch (err) {
              console.error("Delete error:", err);
              Alert.alert("Error", "Could not connect to server.");
            }
          }
        }
      ]
    );
  };
  const handleDeletePost = async (id: string, title: string) => {
    Alert.alert(
      "Delete Post",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://3.85.25.255:3000/DB/posts/delete/${id}`, {
                method: 'DELETE',
              });
  
              const result = await response.json();
  
              if (response.ok) {
                setCommunityPosts((prev) => prev.filter((post) => post.id !== id));
              } else {
                Alert.alert("Error", result.message || "Failed to delete post.");
              }
            } catch (err) {
              console.error("Delete post error:", err);
              Alert.alert("Error", "Could not connect to server.");
            }
          }
        }
      ]
    );
  };
  const handleDeleteEvent = async (id: string, title: string, date: string, start_time: string, end_time: string) => {
    Alert.alert(
      "Delete Event", 
      `Are you sure you want to delete "${title}"?`, 
      [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`http://3.85.25.255:3000/DB/events/delete/${id}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
              setEvents((prev) => prev.filter((e) => e.id !== id));
              const datetime = formatEventDateTime(date, start_time, end_time);
              handleCreateNotification(`Event title: ${title} \nWhen: ${datetime}`, "Event Deleted");
            }
          } catch (err) {
            console.error("Error:", err);
            Alert.alert("Error", "Could not connect to server.");
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {isAdmin && (
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
      )}
  
      {/* Bio Tab */}
      {activeTab === "Bio" && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <FlatList
              data={[]}
              renderItem={null}
              ListHeaderComponent={
                <View style={styles.contentArea}>
                  {isAdmin === "true" && (
                    <View style={styles.bioHeader}>
                      <EditToggleButton 
                        editMode={editMode}
                        onPress={toggleEditMode}
                        style={styles.editButton}
                      />
                    </View>
                  )}
  
                  <TouchableOpacity onPress={handleChangeImage}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.largeImage} />
                    ) : (
                      <Text>Loading image...</Text>
                    )}
                    {editMode && <Text style={styles.changeImageText}>Change Image</Text>}
                  </TouchableOpacity>
  
                  <Text style={styles.sectionTitle}>Description</Text>
                  {editMode ? (
                    <TextInput
                      style={[styles.sectionText, styles.input]}
                      value={bioDescription}
                      onChangeText={setBioDescription}
                      multiline
                      placeholder="Insert description"
                      placeholderTextColor="#aaa"
                    />
                  ) : (
                    <Text style={styles.sectionText}>{bioDescription}</Text>
                  )}
  
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
                      <GooglePlacesAutocomplete
                        ref={googlePlacesRef}
                        placeholder="Location"
                        onPress={(data, details = null) => {
                          setLocation(data.description);
                        }}
                        query={{
                          key: "AIzaSyA5DukSRaMR1oJNR81YxttQsVRmJeFb-Bw",
                          language: "en",
                          types: "geocode",
                        }}
                        fetchDetails={true}
                        styles={{
                          textInput: styles.input,
                          listView: { backgroundColor: "#fff", zIndex: 1000 },
                        }}
                        debounce={300}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.sectionText}>Email: {email}</Text>
                      <Text style={styles.sectionText}>Insta: {insta}</Text>
                      <Text style={styles.sectionText}>Location: {location}</Text>
                    </>
                  )}
  
                  {isAdmin === "true" && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => { handleDeleteClub() } }
                    >
                      <Text style={styles.deleteButtonText}>Delete Club</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
  
      {/* Events Tab */}
      {activeTab === "Events" && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={events}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                isAttending={attendingEvents.has(item.id)}
                isAdmin={isAdmin === "true"}
                onToggleAttend={() => toggleAttendEvent(item.id)}
                onDelete={
                  isAdmin === "true"
                    ? () => handleDeleteEvent(item.id, item.title, item.date, item.start_time, item.end_time)
                    : undefined
                }
                onEdit={
                  isAdmin === "true"
                    ? () => {
                        setSelectedEventId(item.id);
                        setEditEventTitle(item.title);
                        setEditEventDate(item.date);
                        setEditEventStartTime(item.start_time);
                        setEditEventEndTime(item.end_time);
                        setEditEventLocation(item.location);
                        setEditEventDescription(item.description);
                        setOriginalEventTitle(item.title);
                        setOriginalEventDate(item.date);
                        setOriginalEventStartTime(item.start_time);
                        setOriginalEventEndTime(item.end_time);
                        setOriginalEventLocation(item.location);
                        setOriginalEventDescription(item.description);
                        setEditEventModalVisible(true);
                        setHideAddButton(true);
                      }
                    : undefined
                }
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshingEvents} onRefresh={handleRefreshEvents} />}
          />
  
          {/* Add + Modify Event Modals */}
          <AddEventModal
            visible={eventModalVisible}
            onClose={() => {
              setEventModalVisible(false);
              setHideAddButton(false);
            }}
            newEventTitle={newEventTitle}
            onChangeTitle={setNewEventTitle}
            newEventDate={newEventDate}
            onChangeDate={setNewEventDate}
            newEventStartTime={newEventStartTime}
            onChangeStartTime={setNewEventStartTime}
            newEventEndTime={newEventEndTime}
            onChangeEndTime={setNewEventEndTime}
            newEventLocation={newEventLocation}
            onChangeLocation={setNewEventLocation}
            newEventDescription={newEventDescription}
            onChangeDescription={setNewEventDescription}
            onCreate={handleCreateEvent}
          />
          <ModifyEventModal
            visible={editEventModalVisible}
            onClose={() => {
              setEditEventModalVisible(false);
              setHideAddButton(false);
            }}
            newEventTitle={editEventTitle}
            newEventDate={editEventDate}
            newEventStartTime={editEventStartTime}
            newEventEndTime={editEventEndTime}
            newEventLocation={editEventLocation}
            newEventDescription={editEventDescription}

            onChangeTitle={setEditEventTitle}
            onChangeDate={setEditEventDate}
            onChangeStartTime={setEditEventStartTime}
            onChangeEndTime={setEditEventEndTime}
            onChangeLocation={setEditEventLocation}
            onChangeDescription={setEditEventDescription}

            originalEventTitle={originalEventTitle}
            originalEventDate={originalEventDate}
            originalEventStartTime={originalEventStartTime}
            originalEventEndTime={originalEventEndTime}
            originalEventLocation={originalEventLocation}
            originalEventDescription={originalEventDescription}
            
            onCreate={(changes: string) => selectedEventId && handleEditEvent(selectedEventId, editEventTitle,editEventDate,
              editEventStartTime,editEventEndTime,editEventLocation,editEventDescription, changes)}
          />
  
            {isAdmin === "true" && !hideAddButton && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setEventModalVisible(true);
                setHideAddButton(true);
              }}
            >
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>
          )}
        </View>
      )}
  
      {/* Community Tab */}
      {activeTab === "Community" && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={communityPosts}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                isLiked={likedPosts.has(item.id)}
                onToggleLike={() => toggleLikePost(item.id)}
                onDelete={isAdmin === "true" ? () => handleDeletePost(item.id, item.title) : undefined}
                onEdit={
                  isAdmin === "true"
                    ? () => {
                        setSelectedPostId(item.id);
                        setEditPostTitle(item.title);
                        setEditPostContent(item.content);
                        setEditPostImageUri(item.imageUri);
                        setEditPostModalVisible(true);
                        setHidePostAddButton(true);
                      }
                    : undefined
                }
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshingPosts} onRefresh={handleRefreshPosts} />}
          />
  
          <AddPostModal
            visible={postModalVisible}
            onClose={() => {
              setPostModalVisible(false);
              setHidePostAddButton(false);
            }}
            newPostName={newPostName}
            onChangeName={setNewPostName}
            newPostContent={newPostContent}
            onChangeContent={setNewPostContent}
            onCreate={handleCreatePost}
          />
          <ModifyPostModal
            visible={editPostModalVisible}
            onClose={() => {
              setEditPostModalVisible(false);
              setHidePostAddButton(false);
            }}
            newPostName={editPostTitle}
            onChangeName={setEditPostTitle}
            newPostContent={editPostContent}
            onChangeContent={setEditPostContent}
            onSubmit={(imageUri) =>
              selectedPostId &&
              handleEditPost(selectedPostId, editPostTitle, editPostContent, imageUri)
            }
            existingImageUri={editPostImageUri}
            isEdit={true}
          />
  
          {isAdmin === "true" && !hidePostAddButton && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setPostModalVisible(true);
                setHidePostAddButton(true);
              }}
            >
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DAD7CD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#344E41",
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
    color: "#344E41",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionText: {
    color: "#344E41",
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
    color: "#344E41",
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
  deleteButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  postDeleteButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  postDeleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  }  
});
