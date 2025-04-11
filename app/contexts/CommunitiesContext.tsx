import React, { createContext, useState, useEffect, ReactNode } from "react";
import { formatDistanceToNow } from 'date-fns';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

interface CommunitiesContextType {
  communities: { id: string; [key: string]: any }[];
  joinedCommunities: Set<string>;
  adminCommunities: Set<string>;
  likedPosts: Set<string>;
  setCommunities: React.Dispatch<React.SetStateAction<{ id: string; [key: string]: any }[]>>;
  setJoinedCommunities: React.Dispatch<React.SetStateAction<Set<string>>>;
  setAdminCommunities: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchCommunities: () => Promise<void>;
  fetchAdminClubs: () => Promise<void>;
  fetchUserAttribute: (attributeName: string) => Promise<string | null>;
  toggleJoinCommunity: (id: string) => void;
  toggleLikePost: (id: string) => void;
  updateUserAttribute: (attributeName: string, value: string) => Promise<boolean>;
  updateMembersCount: (id: string, changeInt: number) => Promise<void>;
  fetchClubAttribute: (clubId: string, attribute: string) => Promise<string | undefined>;
  updateClubAttribute: (clubId: string, attribute: string, newValue: string) => Promise<void>;
  addCommunity: (newCommunityName: string, newCommunityLocation: string) => Promise<void>;
  fetchPostsForClub: (clubId: string) => void;
  fetchEventsForClub: (clubId: string) => void;
  fetchNotificationsForClub: (clubId: string) => void;
  fetchClubImage: (filePath: any) => Promise<string>;
}

export const CommunitiesContext = createContext<CommunitiesContextType | null>(null);

interface CommunitiesProviderProps {
  children: ReactNode;
}

export const CommunitiesProvider: React.FC<CommunitiesProviderProps> = ({ children }) => {
  //communities list
  const [communities, setCommunities] = useState<{ id: string; [key: string]: any }[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());
  const [adminCommunities, setAdminCommunities] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log("useEffect context");
    fetchCommunities();
    fetchFollowingClubs();
    fetchAdminClubs();
    fetchLikedPosts();
  }, []);

  const fetchCommunities = async () => {
    try {
      console.log("fetching communities");
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
      const data = await response.json();
      const formattedData = await Promise.all(
        data.map(async (community: any) => {
          const clubId = community.id;
          const clubName = community.name;
          const imageUrl = await fetchClubImage(`club_profile_pics/${clubId}_${clubName}`);
  
          return {
            ...community,
            id: String(clubId),
            imageUrl,
          };
        })
      );
      setCommunities(formattedData);
      // console.log("Communities fetched successfully:", formattedData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const fetchAdminClubs = async () => {
    const cognitoSub = await AsyncStorage.getItem("cognitoSub");
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/club_admins/get/admin_id=${cognitoSub}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const adminClubIds = data.map((item: any) => String(item.club_id));
        setAdminCommunities(new Set(adminClubIds));
      } else {
        setAdminCommunities(new Set());
      }
    } catch (error) {
      console.error("Error fetching admin clubs:", error);
    }
  };

  const fetchFollowingClubs = async () => {
    const cognitoSub = await AsyncStorage.getItem("cognitoSub");
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/following/get/user_id=${cognitoSub}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const followingClubIds = data.map((item: any) => String(item.club_id));
        // console.log("Following clubs:", followingClubIds);
        setJoinedCommunities(new Set(followingClubIds));
      } else {
        setJoinedCommunities(new Set());
      }
    } catch (error) {
      console.error("Error fetching following clubs:", error);
    }
  };

  const fetchLikedPosts = async () => {
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/likes/get/user_id=${cognitoSub}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const likedPosts = data.map((item: any) => String(item.post_id));
        console.log("posts liked:", likedPosts);
        setLikedPosts(new Set(likedPosts));
      } else {
        setLikedPosts(new Set());
      }
    } catch (error) {
      console.error("Error fetching post likers:", error);
    }
  };

  const fetchFollowersCount = async (clubId: string) => {
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/following/get/club_id=${clubId}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const followers = data.map((item: any) => String(item.user_id));
        return followers.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchLikersCount = async (postID: string) => {
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/likes/get/post_id=${postID}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const likers = data.map((item: any) => String(item.user_id));
        console.log("likers count:", likers.length);
        return likers.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching post likers:", error);
    }
  };

  const fetchUserAttribute = async (attributeName : any) => {
      const cognitoSub = await AsyncStorage.getItem('cognitoSub');
      try {
          const response = await fetch(`http://3.85.25.255:3000/cognito/get/attribute?sub=${cognitoSub}&attributeName=${attributeName}`);    
          const data = await response.json();

          if (!response.ok) throw new Error(data.message);
          console.log(`${attributeName} fetched successfully:`, data[attributeName]);
          return data[attributeName];
  
      } catch (error) {
          console.error("Network error while fetching attribute:", error);
          return null;
      }
  };

  const toggleJoinCommunity = async (id: string) => {
    const newSet = new Set(joinedCommunities);
    let isJoined = newSet.has(id);
    if (isJoined) {
      newSet.delete(id);
      await unfollow(id);
    } else {
      newSet.add(id);
      await follow(id);
    }
    const newCount = await fetchFollowersCount(id);
    await updateMembersCount(id, newCount); 
    setJoinedCommunities(newSet);
  };

  const follow = async (clubId: string) => {
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/following/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: cognitoSub, club_id: clubId }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
      console.log("follow success: ", result);
    } catch (error) {
      console.error("Error adding following:", error);
      Alert.alert("Error following. Please try again.");
    }
  };

  const unfollow = async (clubId : any) => {
    if (!clubId) {
      console.error("Club ID is required");
      return;
    }
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/following/delete/club_id=${clubId}/user_id=${cognitoSub}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to unfollow");
      console.log("Unfollow success:", clubId, data);
    } catch (error) {
      console.error("Error unfollowing:", error);
      Alert.alert("Error", "Failed to unfollow.");
    }
  };

  const updateUserAttribute = async (attributeName : any, value : any) => {
      const cognitoSub = await AsyncStorage.getItem('cognitoSub');
      try {
          const response = await fetch(`http://3.85.25.255:3000/cognito/update/attribute`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ sub: cognitoSub, attributeName, value }),
          });
          const data = await response.json();

          if (!response.ok) throw new Error(data.message);
          console.log(`${attributeName} updated successfully.`);
          return true;

      } catch (error) {
          console.error("Network error while updating attribute:", error);
          return false;
      }
  };

  const updateMembersCount = async (id: string, newCount: any) => {
    await updateClubAttribute(id, "membersCount", newCount.toString());
    setCommunities((prev) =>
      prev.map((community) => (community.id === id ? { ...community, membersCount: newCount } : community))
    );
  };

  const fetchClubAttribute = async (clubId : any, attribute : any) => {
    if (!clubId || !attribute) {
      console.error("Both clubId and attribute are required.");
      return;
    }
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/clubs/get/attribute?id=${clubId}&attribute=${attribute}`);
      
      if (!response.ok) {
        const data = await response.json();
        console.error("Error fetching club attribute:", data.message);
        return;
      }
      const data = await response.json();
      return data[attribute];
    } catch (error) {
      console.error("Error fetching club attribute:", error);
    }
  };

  const updateClubAttribute = async (clubId: string, attribute: string, newValue: string) => {
    try {
      await fetch(`http://3.85.25.255:3000/DB/clubs/update/attribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clubId, attribute, value: newValue }),
      });
    } catch (error) {
      console.error("Error updating attribute:", error);
    }
  };

  const addCommunity = async (newCommunityName: string, newCommunityLocation: string) => {
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      console.log("Adding new community...");
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCommunityName, location: newCommunityLocation, admin_id: cognitoSub }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
      setAdminCommunities(new Set(adminCommunities).add(result.id.toString()));
      setCommunities([...communities, { id: result.id.toString(), name: newCommunityName, location: newCommunityLocation, membersCount: 0 }]);
    } catch (error) {
      console.error("Error adding community:", error);
      Alert.alert("Error adding community. Please try again.");
    }
  };

  const toggleLikePost = async (postID: string) => {
    console.log("Toggling like for post ID:", postID);
    const newSet = new Set(likedPosts);
    let isLiked = newSet.has(postID);
    if (isLiked) {
      newSet.delete(postID);
      await dislikePost(postID);
    } else {
      newSet.add(postID);
      await likePost(postID);
    }
    await updatePostLikes(postID);
    setLikedPosts(newSet);
    console.log("End of toggle");
  };

  const likePost = async (postID: string) => {
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      const response = await fetch("http://3.85.25.255:3000/DB/likes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: cognitoSub, post_id: postID }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || "Unknown error");
      }
      console.log("likePost success: ", result);
    } catch (error) {
      console.error("Error liking post:", error);
      Alert.alert("Error liking post. Please try again.");
    }
  };

  const dislikePost = async (postID : any) => {
    if (!postID) {
      console.error("Post ID is required");
      return;
    }
    const cognitoSub = await AsyncStorage.getItem('cognitoSub');
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/likes/delete/post_id=${postID}/user_id=${cognitoSub}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to dislike");
      console.log("Dislike success:", postID, data);
    } catch (error) {
      console.error("Error disliking:", error);
      Alert.alert("Error", "Failed to dislike.");
    }
  };

  const updatePostLikes = async (postID: string) => {
    const newCount = await fetchLikersCount(postID);
    try {
      await fetch(`http://3.85.25.255:3000/DB/posts/update/attribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postID, attribute: "likes", value: newCount }),
      });
      console.log("Post likes updated successfully");
    } catch (error) {
      console.error("Error updating attribute:", error);
    }
  };

  const fetchEventsForClub = async (clubId: any) => {
    if (!clubId) {
      console.error("Club ID is required");
      return;
    }
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/events/get/club_id=${clubId}`);
      const data = await response.json();
  
      if (response.ok) {
        const clubName = await fetchClubAttribute(clubId, "name");
        const clubImageUrl = await fetchClubImage(`club_profile_pics/${clubId}_${clubName}`);
        // Format the date of each event to "YYYY-MM-DD"
        const formattedEvents = data.map((event: any) => {
          const date = new Date(event.date);  // assuming 'date' is the key holding the date string
          return {
            ...event,
            date: date.toISOString().split("T")[0],
            clubName,
            clubImageUrl,
          };
        });
        return formattedEvents;
      } else {
        Alert.alert("Error", "Failed to fetch events.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const fetchPostsForClub = async (clubId : any) => {
    if (!clubId) {
      console.error("Club ID is required");
      return;
    }
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch posts");
      // console.log("📦 Raw post data from backend:", data);

      const clubName = await fetchClubAttribute(clubId, "name");
      const clubImageUrl = await fetchClubImage(`club_profile_pics/${clubId}_${clubName}`);

      const formattedPosts = data.map((post: any) => {
        const parsedTime = new Date(post.created_at);
        // console.log("⏰ Parsed time:", post.time, "=>", parsedTime.toString());
      
        return {
          ...post,
          timeFormatted: !isNaN(parsedTime.getTime())
            ? formatDistanceToNow(parsedTime, { addSuffix: true })
            : "Unknown time",
            clubName,
            clubImageUrl,
        };
      });
      return formattedPosts;
    } catch (error) {
      console.error("Error fetching posts for club:", error);
      Alert.alert("Error", "Failed to fetch posts for the club.");
    }
  };

  const fetchNotificationsForClub = async (clubId : any) => {
    if (!clubId) {
      console.error("Club ID is required");
      return;
    }
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/notifications/get/club_id=${clubId}`);
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch notifications");
      console.log("Notifications fetched for club:", clubId, data);

      const clubName = await fetchClubAttribute(clubId, "name");
      const clubImageUrl = await fetchClubImage(`club_profile_pics/${clubId}_${clubName}`);
      
      const formattedNotifications = data.map((notification: any) => ({
        ...notification,
        time: formatDistanceToNow(new Date(notification.time), { addSuffix: true }),
        clubName,
        clubImageUrl,
      }));
      return formattedNotifications;
    } catch (error) {
      console.error("Error fetching notifications for club:", error);
      Alert.alert("Error", "Failed to fetch notifications for the club.");
    }
  };

  const fetchClubImage = async (filePath : any) => {
    const defaultPath = `club_profile_pics/default`;
    try {
    const response = await fetch(
        `http://3.85.25.255:3000/S3/get/image?filePath=${encodeURIComponent(filePath)}&defaultPath=${encodeURIComponent(defaultPath)}`
    );
    const data = await response.json();
    return data.url;
    } catch (error) {
        console.error("Failed to fetch image:", error);
    }
  };

  return (
    <CommunitiesContext.Provider
      value={{
        communities,
        joinedCommunities,
        adminCommunities,
        likedPosts,
        setCommunities,
        setJoinedCommunities,
        setAdminCommunities,
        fetchCommunities,
        fetchAdminClubs,
        fetchUserAttribute,
        toggleJoinCommunity,
        toggleLikePost,
        updateUserAttribute,
        updateMembersCount,
        fetchClubAttribute,
        updateClubAttribute,
        addCommunity,
        fetchPostsForClub,
        fetchEventsForClub,
        fetchNotificationsForClub,
        fetchClubImage,
      }}
    >
      {children}
    </CommunitiesContext.Provider>
  );
};