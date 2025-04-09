import React, { useState, useEffect, useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ImageSourcePropType} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import EventCard, { Event } from "../../components/ExploreComponents/EventCard";
import PostCard, { Post } from "../../components/ExploreComponents/PostCard";
import AddEventModal from "../../components/ExploreComponents/AddEventModal";
import AddPostModal from "../../components/ExploreComponents/AddPostModal";
import EditToggleButton from "../../components/ExploreComponents/EditToggleButton";
import { CommunitiesContext } from "../../contexts/CommunitiesContext";

const placeholderImage = require("../../../assets/images/placeholder.png");

const initialEvents: Event[] = [
  {
    id: "1",
    date: "02/28/2025",
    time: "4pm",
    datetime: "02/28/2025 @ 4pm",
    location: "Gainesville, FL",
    title: "Weekly book organizing",
    description: "Sort new books into the correct area",
    attendees: 5,
  },
];

const initialPosts: Post[] = [
  {
    id: "1",
    title: "Group Reading",
    time: "8h",
    content: "Last Tuesday, we had a huge turnout!",
    likes: 2,
    comments: 0,
  },
];

export default function CommunityDetailsScreen() {
  const router = useRouter();
  const { id, name, isAdmin, startTab} = useLocalSearchParams();

  const {
    fetchClubAttribute = () => {},
    updateClubAttribute = () => {},
    fetchPostsForClub = () => {},
    fetchEventsForClub = () => {}
  } = useContext(CommunitiesContext) || {};
  
  const communitiesContext = useContext(CommunitiesContext);

  const [activeTab, setActiveTab] = useState<"Bio" | "Events" | "Community">("Bio");

  // State for Bio editing
  const [editMode, setEditMode] = useState(false);
  const [originalBioDescription, setOriginalBioDescription] = useState(""); // Store the original value
  const [bioDescription, setBioDescription] = useState("We are a group that loves to read, meet up, etc.");
  const [originalEmail, setOriginalEmail] = useState(""); // Store the original value
  const [email, setEmail] = useState("example@gmail.com");  
  const [originalInsta, setOriginalInsta] = useState(""); // Store the original value
  const [insta, setInsta] = useState("@insertHandle");
 
  // const [profileImage, setProfileImage] = useState<ImageSourcePropType>(placeholderImage);
  const [imageUrl, setImageUrl] = useState("");

  // Events state
  const [events, setEvents] = useState(initialEvents);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");

  // Posts
  const [communityPosts, setCommunityPosts] = useState(initialPosts);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostName, setNewPostName] = useState("");
  const [newPostContent, setNewPostContent] = useState("");


  const handleCreateNotification = async (newTitle : any, newType : any) => {
    if (!newTitle || !newType) {
      console.log('All fields are required');
      return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const response = await fetch("http://3.85.25.255:3000/DB/notifications/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,
                type: newType,
                club_id: id,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to create notification");
        console.log("Notification created: ", data);
    } catch (error) {
        console.error("Error creating notification:", error);
        Alert.alert("Error", "Could not connect to server.");
    }
  };

  // Community posts state
  const handleCreateEvent = async () => {
    if (!newEventTitle || !newEventDate || !newEventTime || !newEventLocation || !newEventDescription) {
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
                time: newEventTime,
                location: newEventLocation,
                description: newEventDescription,
                club_id: id, // Assuming 'id' is the club's ID
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const newEvent: Event = {
                id: data.id.toString(),
                date: newEventDate,
                time: newEventTime,
                location: newEventLocation,
                title: newEventTitle,
                description: newEventDescription,
                attendees: 0,
            };

            setEvents([...events, newEvent]);
            setEventModalVisible(false);
            setNewEventTitle("");
            setNewEventDate("");
            setNewEventTime("");
            setNewEventLocation("");
            setNewEventDescription("");
            const datetime = formatEventDateTime(newEventDate, newEventTime);
            handleCreateNotification(datetime, "New Event");
        } else {
            Alert.alert("Error", data.message || "Failed to create event.");
        }
    } catch (error) {
        console.error("Error creating event:", error);
        Alert.alert("Error", "Could not connect to server.");
    }
  };

  // Return white color if tab is active, else gray
  const handleCreatePost = async () => {
    if (!newPostName || !newPostContent) {
        Alert.alert("Error", "Title and content are required.");
        return;
    }

    try {
        const response = await fetch("http://3.85.25.255:3000/DB/posts/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newPostName,
                content: newPostContent,
                filePath: "", // You might want to add file upload functionality later
                club_id: id, // Assuming 'id' is the club's ID
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const newPost: Post = {
                id: data.id.toString(),
                title: newPostName,
                time: "0h",
                content: newPostContent,
                likes: 0,
                comments: 0,
            };

            setCommunityPosts([...communityPosts, newPost]);
            setPostModalVisible(false);
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

  const formatEventDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    let [hours, minutes] = timeStr.split(':').map(Number);

    // Create a new date object combining the date and the time to adjust for time zone
    const dateTime = new Date(date);
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);

    // Get timezone offset in hours and adjust hours accordingly
    const timeZoneOffsetInHours = dateTime.getTimezoneOffset() / 60;
    dateTime.setHours(dateTime.getHours() - timeZoneOffsetInHours);

    // Convert 24-hour time to 12-hour format with AM or PM
    hours = dateTime.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = dateTime.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${dateTime.getMonth() + 1}/${dateTime.getDate()}/${dateTime.getFullYear().toString().slice(-2)}`;
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return `${formattedDate} @ ${formattedTime}`;
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



  useEffect(() => {
    console.log("isAdmin: ", isAdmin);
    setActiveTab(startTab as "Bio" | "Events" | "Community");
    fetchImage(`club_profile_pics/${id}_${name}`, `user_profile_pics/default`);
    // fetchClubAttribute(id, "description").then((description) => {
    //   if (description) {
    //     setBioDescription(description);
    //     setOriginalBioDescription(description); // Save the original value
    //   }
    // });
    // fetchClubAttribute(id, "email").then((email) => {
    //   if (email) {
    //     setEmail(email);
    //     setOriginalEmail(email); // Save the original value
    //   }
    // });
    // fetchClubAttribute(id, "instagram").then((instagram) => {
    //   if (instagram) {
    //     setInsta(instagram);
    //     setOriginalInsta(instagram); // Save the original value
    //   }
    // });
    loadClubAttribute(id, "description", setBioDescription, setOriginalBioDescription);
    loadClubAttribute(id, "email", setEmail, setOriginalEmail);
    loadClubAttribute(id, "instagram", setInsta, setOriginalInsta);
  }, []);
  
  const loadClubAttribute = async (
    clubId: string,
    field: string,
    setValue: (value: string) => void,
    setOriginalValue: (value: string) => void
  ) => {
    const attribute = await fetchClubAttribute(clubId, field);
    if (attribute) {
      setValue(attribute);
      setOriginalValue(attribute); // Save the original value
    }
  };

  useEffect(() => {
    handleFetchPostsForClub(id); // Fetch posts for the specific club
    handleFetchEventsForClub(id);
  }, []); // Dependency on 'id' to fetch posts when the club changes


  const handleFetchPostsForClub = async (clubId: any) => {
    const data = await fetchPostsForClub(clubId);
    setCommunityPosts(data);
  };

  const handleFetchEventsForClub = async (clubId: any) => {
    const data = await fetchEventsForClub(clubId);
    setEvents(data);
  };


  //image functions
  const fetchImage = async (filePath : any, defaultPath : any) => {
    try {
        console.log("filePath: ", filePath);
        const response = await fetch(`http://3.85.25.255:3000/S3/get/image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`);
        const data = await response.json();
        // console.log("Signed URL: ", data.url);
        setImageUrl(data.url);
    } catch (error) {
        console.error('Failed to fetch image:', error);
    }
  };
  const uploadImage = async (filePath : any, imageUri : any) => {
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
        fetchImage(`club_profile_pics/${id}_${name}`, `user_profile_pics/default`);
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
        uploadImage(`club_profile_pics/${id}_${name}`, result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {isAdmin && (
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
      )}

      {/* Main Content */}
      <View style={styles.contentArea}>
        {activeTab === "Bio" && (
          <View>
            {/* Bio Header with Edit Button */}
            {isAdmin === "true" && (
              <View style={styles.bioHeader}>
                <EditToggleButton 
                  editMode={editMode}
                  onPress={toggleEditMode}
                  style={styles.editButton}
                />
              </View>
            )}
            {/* <View style={styles.bioHeader}>
              <EditToggleButton 
                editMode={editMode}
                onPress={toggleEditMode}
                style={styles.editButton}
              />
            </View> */}

            {/* Profile Image */}
            <TouchableOpacity onPress={handleChangeImage}>
              {/* <Image source={profileImage} style={styles.largeImage} /> */}
              {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.largeImage} />
              ) : (
                  <Text>Loading image...</Text>
              )}
              {/* <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} /> */}

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
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EventCard event={{
                  id: item.id,
                  datetime: formatEventDateTime(item.date, item.time), // Ensure this is calculated before passing
                  location: item.location,
                  title: item.title,
                  description: item.description,
                  attendees: item.attendees
                }} />
                
            )}
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
            {isAdmin === "true" && (
              <TouchableOpacity style={styles.addButton} onPress={() => setEventModalVisible(true)}>
                <Ionicons name="add" size={32} color="black" />
              </TouchableOpacity>
            )}
            {/* <TouchableOpacity style={styles.addButton} onPress={() => setEventModalVisible(true)}>
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity> */}
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
            {isAdmin === "true" && (
              <TouchableOpacity style={styles.addButton} onPress={() => setPostModalVisible(true)}>
                <Ionicons name="add" size={32} color="black" />
              </TouchableOpacity>
            )}
            {/* <TouchableOpacity style={styles.addButton} onPress={() => setPostModalVisible(true)}>
              <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity> */}
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