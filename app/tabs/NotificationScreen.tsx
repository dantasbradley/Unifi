import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet, Text } from "react-native";
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

    const handleFetchNotificationsForClub = async (clubId: any) => {
        const data = await fetchNotificationsForClub(clubId);
        console.log("Fetched Notifs: ", data);
        setNotifications((prevNotifs) => {
            const uniqueNotifs = new Set(prevNotifs.map((notif) => notif.id));
            const newNotifs = data.filter((notif) => !uniqueNotifs.has(notif.id));
            const combined = [...prevNotifs, ...newNotifs];
            // Sort by created_at descending (newest first)
            combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return combined;
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>This page shows notifications for communities you follow. Follow one to get started!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#DAD7CD",
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
    marginTop: 10,
  },
  emptyText: {
    color: "#344E41",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
});

export default NotificationScreen;