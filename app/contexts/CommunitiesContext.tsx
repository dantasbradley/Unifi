import React, { createContext, useState, useEffect, ReactNode } from "react";
import { formatDistanceToNow } from 'date-fns';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

interface CommunitiesContextType {
  communities: { id: string; [key: string]: any }[];
  joinedCommunities: Set<string>;
  adminCommunities: Set<string>;
  setCommunities: React.Dispatch<React.SetStateAction<{ id: string; [key: string]: any }[]>>;
  setJoinedCommunities: React.Dispatch<React.SetStateAction<Set<string>>>;
  setAdminCommunities: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchCommunities: () => Promise<void>;
  fetchAdminClubs: () => Promise<void>;
  fetchUserAttribute: (attributeName: string) => Promise<string | null>;
  toggleJoinCommunity: (id: string) => void;
  updateUserAttribute: (attributeName: string, value: string) => Promise<boolean>;
  updateMembersCount: (id: string, changeInt: number) => Promise<void>;
  fetchClubAttribute: (clubId: string, attribute: string) => Promise<string | undefined>;
  updateClubAttribute: (clubId: string, attribute: string, newValue: string) => Promise<void>;
  addCommunity: (newCommunityName: string, newCommunityLocation: string) => Promise<void>;
  fetchPostsForClub: (clubId: string) => void;
  fetchEventsForClub: (clubId: string) => void;
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

  useEffect(() => {
    console.log("useEffect context");
    fetchCommunities();
    fetchUserAttribute("custom:clubs_following").then((clubs) => {
      if (clubs) {
        let clubsList = clubs === "No Clubs" ? [] : clubs.split(',').map(club => club.trim());
        const uniqueClubs = new Set(clubsList); // Assuming IDs are strings
        setJoinedCommunities(uniqueClubs);
        console.log("Followed clubs retrieved and deduplicated:", Array.from(uniqueClubs));
      }
    });
    fetchAdminClubs();
  }, []);

  const fetchCommunities = async () => {
    try {
      console.log("fetching communities");
      const response = await fetch("http://3.85.25.255:3000/DB/clubs/get");
      const data = await response.json();
      const formattedData = data.map((community: any) => ({
        ...community,
        id: String(community.id),
      }));
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

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        updateMembersCount(id, -1);
      } else {
        newSet.add(id);
        updateMembersCount(id, 1);
      }
      updateUserAttribute("custom:clubs_following", Array.from(newSet).join(","));
      return newSet;
    });
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

  const updateMembersCount = async (id: string, changeInt: number) => {
    const attributeName = "membersCount";
    const membersCount = await fetchClubAttribute(id, attributeName);
    if (membersCount !== undefined) {
      const newCount = parseInt(membersCount) + changeInt;
      await updateClubAttribute(id, attributeName, newCount.toString());
      setCommunities((prev) =>
        prev.map((community) => (community.id === id ? { ...community, membersCount: newCount } : community))
      );
    }
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

  // Function to fetch posts for a specific club based on the club ID
  // const fetchPostsForClub = async (clubId: any) => {
  //   if (!clubId) {
  //     console.error("Club ID is required");
  //     return;
  //   }
  //   try {
  //     const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
  //     const data = await response.json();
  //     if (response.ok) {
  //       return data;
  //     } else {
  //       Alert.alert("Error", "Failed to fetch posts.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //     Alert.alert("Error", "Could not connect to server.");
  //   }
  // };
  const fetchPostsForClub = async (clubId : any) => {
    if (!clubId) {
      console.error("Club ID is required");
      return;
    }
    try {
      const response = await fetch(`http://3.85.25.255:3000/DB/posts/get/club_id=${clubId}`);
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch posts");
      console.log("Posts fetched for club:", clubId, data);
      const formattedPosts = data.map((post: any) => {
        post.time = formatDistanceToNow(new Date(post.time), { addSuffix: true })
        return post;
      });
      return formattedPosts;
      // setPosts(prevPosts => [...prevPosts, ...data.map(post => ({
      //   ...post,
      //   time: formatDistanceToNow(new Date(post.time), { addSuffix: true })
      // }))]);
    } catch (error) {
      console.error("Error fetching posts for club:", error);
      Alert.alert("Error", "Failed to fetch posts for the club.");
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
        // Format the date of each event to "YYYY-MM-DD"
        const formattedEvents = data.map((event: any) => {
          const date = new Date(event.date);  // assuming 'date' is the key holding the date string
          event.date = date.toISOString().split('T')[0];  // Format to "YYYY-MM-DD"
          return event;
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

  return (
    <CommunitiesContext.Provider
      value={{
        communities,
        joinedCommunities,
        adminCommunities,
        setCommunities,
        setJoinedCommunities,
        setAdminCommunities,
        fetchCommunities,
        fetchAdminClubs,
        fetchUserAttribute,
        toggleJoinCommunity,
        updateUserAttribute,
        updateMembersCount,
        fetchClubAttribute,
        updateClubAttribute,
        addCommunity,
        fetchPostsForClub,
        fetchEventsForClub,
      }}
    >
      {children}
    </CommunitiesContext.Provider>
  );
};
