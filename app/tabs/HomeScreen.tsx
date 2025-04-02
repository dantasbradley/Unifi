// import React, { useState, useEffect } from "react";
// import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const HomeScreen = () => {
//   // Sample data; replace later with data from communities
//   const [posts, setPosts] = useState([
//     {
//       id: "1",
//       user: "Coding Club",
//       time: "10h",
//       content: "Today, we have yet another day of coding...",
//       likes: 824,
//       comments: 10
//     }
//   ]);

//   const [joinedCommunities, setJoinedCommunities] = useState(new Set<string>());
//   const [communities, setCommunities] = useState([]);
//   const [communityPosts, setCommunityPosts] = useState(posts);


//   const getJoinedCommunities = async () => {
//       fetchCommunities();
//       fetchUserAttribute("custom:clubs_following").then((clubs) => {
//         if (clubs) {
//           console.log("Clubs:", clubs);
//           let clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
//           const uniqueClubs = new Set(clubsList); // Assuming IDs are strings
//           setJoinedCommunities(uniqueClubs);
//           console.log("Followed clubs retrieved and deduplicated:", Array.from(uniqueClubs));
//         }
//       });
//     }

//     const fetchCommunities = async () => {
//       try {
//         const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
//         const data = await response.json();
//         // Ensure IDs are strings if they're stored as strings in joinedCommunities
//         const formattedData = data.map(community => ({
//             ...community,
//             id: String(community.id) // Convert to string if necessary
//         }));
//         setCommunities(formattedData);
//         console.log("Communities fetched successfully:", formattedData);
//       } catch (error) {
//         console.error("Error fetching clubs:", error);
//       }
//     };

//     const fetchUserAttribute = async (attributeName : any) => {
//       const cognitoSub = await AsyncStorage.getItem('cognitoSub');
//       try {
//           const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);    
//           const data = await response.json();

//           if (!response.ok) throw new Error(data.message);
//           console.log(`${attributeName} fetched successfully:`, data[attributeName]);
//           return data[attributeName];
  
//       } catch (error) {
//           console.error("Network error while fetching attribute:", error);
//           return null;
//       }
//   };

//   const fetchPostsForClub = async (clubId: any) => {
//       if (!clubId) {
//         console.error("Club ID is required");
//         return;
//       }
  
//       try {
//         const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
//         const data = await response.json();
  
//         if (response.ok) {
//           setCommunityPosts(data); // Update the state with the fetched posts
//         } else {
//           Alert.alert("Error", "Failed to fetch posts.");
//         }
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//         Alert.alert("Error", "Could not connect to server.");
//       }
//     };

    

//   useEffect(() => {
//     getJoinedCommunities();
//     for(int i = 0; i < joinedCommunities.size(); i++)
//     {

//       fetchPostsForClub(joinedCommunities[i]);
//     }
//   }, []);

//   // Function to "like" a post
//   const handleLike = (postId) => {
//     setPosts((currentPosts) =>
//       currentPosts.map((post) =>
//         post.id === postId ? { ...post, likes: post.likes + 1 } : post
//       )
//     );
//   };

//   const renderPost = ({ item }) => {
//     return (
//       <View style={styles.postContainer}>
//         {/* Header: user name and time */}
//         <View style={styles.postHeader}>
//           <Text style={styles.userName}>{item.user}</Text>
//           <Text style={styles.postTime}>{item.time}</Text>
//         </View>

//         {/* Content */}
//         <Text style={styles.postContent}>{item.content}</Text>

//         {/* Actions row (like, comment, share) */}
//         <View style={styles.postActions}>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => handleLike(item.id)}
//           >
//             <Ionicons name="heart-outline" size={20} color="#fff" />
//             <Text style={styles.actionText}>{item.likes}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton}>
//             <Ionicons name="chatbubble-outline" size={20} color="#fff" />
//             <Text style={styles.actionText}>{item.comments}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton}>
//             <Ionicons name="share-social-outline" size={20} color="#fff" />
//             <Text style={styles.actionText}>Share</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Feed */}
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.id}
//         renderItem={renderPost}
//       />
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: "#222",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   postHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 5,
//   },
//   userName: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   postTime: {
//     color: "#999",
//   },
//   postContent: {
//     color: "#fff",
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   postActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//     paddingTop: 10,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   actionText: {
//     color: "#fff",
//     marginLeft: 5,
//   },
// });

// import React, { useState, useEffect } from "react";
// import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const HomeScreen = () => {
//   const [posts, setPosts] = useState([]);
//   const [joinedCommunities, setJoinedCommunities] = useState(new Set());

//   const getJoinedCommunities = async () => {
//     await fetchCommunities();
//     const clubs = await fetchUserAttribute("custom:clubs_following");
//     if (clubs) {
//       const clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
//       const uniqueClubs = new Set(clubsList);
//       setJoinedCommunities(uniqueClubs);
//       Array.from(uniqueClubs).forEach(fetchPostsForClub); // Fetch posts for each club
//     }
//   };

//   const fetchCommunities = async () => {
//     try {
//       const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
//       if (!response.ok) throw new Error("Failed to fetch communities");
//       const data = await response.json();
//       // You can update state or do something with communities here if needed
//     } catch (error) {
//       console.error("Error fetching clubs:", error);
//       Alert.alert("Error", "Failed to fetch community data.");
//     }
//   };

//   const fetchUserAttribute = async (attributeName) => {
//     try {
//       const cognitoSub = await AsyncStorage.getItem('cognitoSub');
//       const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);
//       if (!response.ok) throw new Error("Failed to fetch user attributes");
//       const data = await response.json();
//       return data[attributeName];
//     } catch (error) {
//       console.error("Network error while fetching attribute:", error);
//       return null;
//     }
//   };

//   const fetchPostsForClub = async (clubId) => {
//     try {
//       const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
//       if (!response.ok) throw new Error("Failed to fetch posts");
//       const data = await response.json();
//       setPosts(prevPosts => [...prevPosts, ...data]);  // Append new posts to the existing ones
//     } catch (error) {
//       console.error("Error fetching posts for club:", error);
//       Alert.alert("Error", "Failed to fetch posts for the club.");
//     }
//   };

//   useEffect(() => {
//     getJoinedCommunities(); // Fetch joined communities and their posts on mount
//   }, []);

//   // Function to "like" a post
//   const handleLike = (postId) => {
//     setPosts((currentPosts) =>
//       currentPosts.map((post) =>
//         post.id === postId ? { ...post, likes: post.likes + 1 } : post
//       )
//     );
//   };

//   const renderPost = ({ item }) => (
//     <View style={styles.postContainer}>
//       <View style={styles.postHeader}>
//         <Text style={styles.userName}>{item.user}</Text>
//         <Text style={styles.postTime}>{item.time}</Text>
//       </View>
//       <Text style={styles.postContent}>{item.content}</Text>
//       <View style={styles.postActions}>
//         <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
//           <Ionicons name="heart-outline" size={20} color="#fff" />
//           <Text style={styles.actionText}>{item.likes}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Ionicons name="chatbubble-outline" size={20} color="#fff" />
//           <Text style={styles.actionText}>{item.comments}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionButton}>
//           <Ionicons name="share-social-outline" size={20} color="#fff" />
//           <Text style={styles.actionText}>Share</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderPost}
//       />
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//     padding: 10,
//   },
//   postContainer: {
//     backgroundColor: "#222",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   postHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 5,
//   },
//   userName: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   postTime: {
//     color: "#999",
//   },
//   postContent: {
//     color: "#fff",
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   postActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//     paddingTop: 10,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   actionText: {
//     color: "#fff",
//     marginLeft: 5,
//   },
// });

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState(new Set());

  const getJoinedCommunities = async () => {
    console.log("Fetching joined communities...");
    await fetchCommunities();
    const clubs = await fetchUserAttribute("custom:clubs_following");
    if (clubs) {
      const clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
      const uniqueClubs = new Set(clubsList);
      setJoinedCommunities(uniqueClubs);
      console.log("Joined clubs:", Array.from(uniqueClubs));
      uniqueClubs.forEach(fetchPostsForClub);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
      if (!response.ok) throw new Error("Failed to fetch communities");
      const data = await response.json();
      console.log("Communities fetched:", data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      Alert.alert("Error", "Failed to fetch community data.");
    }
  };

  const fetchUserAttribute = async (attributeName) => {
    try {
      const cognitoSub = await AsyncStorage.getItem('cognitoSub');
      const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);
      if (!response.ok) throw new Error("Failed to fetch user attributes");
      const data = await response.json();
      console.log("User attribute fetched:", attributeName, data[attributeName]);
      return data[attributeName];
    } catch (error) {
      console.error("Network error while fetching attribute:", error);
      return null;
    }
  };

  const fetchPostsForClub = async (clubId) => {
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      console.log("Posts fetched for club:", clubId, data);
      setPosts(prevPosts => [...prevPosts, ...data.map(post => ({
        ...post,
        time: formatDistanceToNow(new Date(post.time), { addSuffix: true })
      }))]);
    } catch (error) {
      console.error("Error fetching posts for club:", error);
      Alert.alert("Error", "Failed to fetch posts for the club.");
    }
  };

  useEffect(() => {
    getJoinedCommunities();
  }, []);

  const handleLike = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.postTime}>{item.time}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  postContainer: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
  },
  postTime: {
    color: "#999",
  },
  postContent: {
    color: "#fff",
    marginBottom: 10,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    marginLeft: 5,
  },
});
