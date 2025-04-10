import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import { CommunitiesContext } from "../contexts/CommunitiesContext";
import NotificationCard from "../components/NotificationCard";
import { useRouter } from "expo-router";

interface NotificationProps {
  profile: string;
}

const NotificationScreen: React.FC<NotificationProps> = ({ profile }) => {
    const router = useRouter();
    const { 
        joinedCommunities = new Set(), 
        adminCommunities = new Set(),
        fetchNotificationsForClub = () => {}, 
        fetchClubAttribute = () => {} 
      } = useContext(CommunitiesContext) || {};
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const handleRefresh = async () => {
        console.log("refreshing home screen");
        setRefreshing(true);
        try {
            setNotifications([]);
            await fetchJoinedCommunitiesNotifications();
            setRefreshKey(Date.now());
        } catch (error) {
            console.error("Error refreshing communities:", error);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        setNotifications([]);
        fetchJoinedCommunitiesNotifications();
    }, [joinedCommunities]);

    const fetchJoinedCommunitiesNotifications = async () => {
        console.log("Joined clubs:", Array.from(joinedCommunities));
        joinedCommunities.forEach(handleFetchNotificationsForClub);
    };
    const fetchImage = async (filePath : any, defaultPath : any) => {
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

    const handleFetchNotificationsForClub = async (clubId: any) => {
        const data = await fetchNotificationsForClub(clubId);
        console.log("Fetched Notifs: ", data);
        const club_name = await fetchClubAttribute(clubId, "name");
        const image_url = await fetchImage(`club_profile_pics/${clubId}_${club_name}`, `user_profile_pics/default`);
        const enrichedData = data.map((notif: any) => ({
            ...notif,
            clubName: club_name || "Unknown Club",
            imageUrl: image_url,
        }));
        setNotifications((prevNotifs) => {
            const uniqueNotifs = new Set(prevNotifs.map((notif) => notif.id));
            const newNotifs = enrichedData.filter((notif) => !uniqueNotifs.has(notif.id));
            return [...prevNotifs, ...newNotifs];
        });
    };

  return (
    <View style={styles.container}>
      <FlatList
        key={refreshKey}
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <NotificationCard
                item={item}
                onPress={() => router.push({
                    pathname: "/tabs/ExploreScreen/CommunityDetails",
                    params: { id: item.club_id, name: item.clubName, isAdmin: adminCommunities.has(item.club_id.toString()), startTab: "Events" },
                })}
            />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});

export default NotificationScreen;