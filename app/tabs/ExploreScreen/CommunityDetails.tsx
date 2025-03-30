import React, { useState, useEffect } from "react";
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
    time: "8h",
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

  const updateClubAttribute = async (clubId: any, attribute: string, newValue: string) => {
    try {
        const response = await fetch(`http://3.85.25.255:3000/api/update-club-attribute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ club_id: clubId, attribute, value: newValue }),
        });

        if (response.ok) console.log(`${attribute} updated successfully!`);
        else console.error(`Failed to update ${attribute}`);
    } catch (error) {
        console.error(`Error updating ${attribute}:`, error);
    }
  };

  // Toggle edit mode and save changes when toggling off
  const toggleEditMode = () => {
    // TODO: Add saving logic here before exiting edit mode
    
    if (editMode) {
      console.log("Saving changes...");
      if (bioDescription !== originalBioDescription) {
        updateClubAttribute(id, "description", bioDescription);
        setOriginalBioDescription(bioDescription); // Update the original value
      } else {
        console.log("No changes detected in bio description.");
      }
      if (email !== originalEmail) {
        updateClubAttribute(id, "email", email);
        setOriginalEmail(email); // Update the original value
      } else {
        console.log("No changes detected in email.");
      }
      if (insta !== originalInsta) {
        updateClubAttribute(id, "instagram", insta);
        setOriginalInsta(insta); // Update the original value
      } else {
        console.log("No changes detected in insta.");
      }
    }
    setEditMode((prev) => !prev);

  };



  useEffect(() => {
    fetchImage(`club_profile_pics/${id}_${name}`, `user_profile_pics/default`);
    fetchClubAttribute(id, "description").then((description) => {
      if (description) {
        setBioDescription(description);
        setOriginalBioDescription(description); // Save the original value
      }
    });
    fetchClubAttribute(id, "email").then((email) => {
      if (email) {
        setEmail(email);
        setOriginalEmail(email); // Save the original value
      }
    });
    fetchClubAttribute(id, "instagram").then((instagram) => {
      if (instagram) {
        setInsta(instagram);
        setOriginalInsta(instagram); // Save the original value
      }
    });
  }, []);

  // const [bioDescription, setBioDescription] = useState("We are a group that loves to read, meet up, etc.");
  // const [email, setEmail] = useState("example@gmail.com");
  // const [insta, setInsta] = useState("@insertHandle");

  const fetchClubAttribute = async (clubId : any, attribute : any) => {
    if (!clubId || !attribute) {
        console.error("Both clubId and attribute are required.");
        return;
    }

    try {
        const response = await fetch(`http://3.85.25.255:3000/api/club-attribute?club_id=${clubId}&attribute=${attribute}`);
        
        if (!response.ok) {
            const data = await response.json();
            console.error("Error fetching club attribute:", data.message);
            return;
        }

        const data = await response.json();
        
        // Assuming you're working with state or something else to store the result
        // console.log(`${attribute} for club ${clubId}:`, data[attribute]);
        return data[attribute];  // You can handle this further depending on what you want to do with the data

    } catch (error) {
        console.error("Error fetching club attribute:", error);
    }
  };

  const fetchImage = async (filePath : any, defaultPath : any) => {
    try {
        console.log("filePath: ", filePath);
        const response = await fetch(`http://3.85.25.255:3000/get-user-image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`);
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
        const response = await fetch(`http://3.85.25.255:3000/generate-presigned-url?filePath=${encodeURIComponent(filePath)}`);
        const { url } = await response.json();
        const blob = await (await fetch(imageUri)).blob();
        // Use the pre-signed URL to upload the blob
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: blob,
        });
        fetchImage(`club_profile_pics/${id}_${name}`, `club_profile_pics/default`);
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
    // const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (permissionResult.granted === false) {
    //     alert("You've refused to allow this app to access your photos!");
    //     return;
    // }
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
