import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

interface NotificationProps {
    profile: string
}

type Notification = {
    org: string,
    type: string,
    toc: number,
    body: string
}

const NotificationScreen: React.FC<NotificationProps> = ({profile}) => {
    const [notifications, setNotifications] = useState<Notification[] | null>(null);

    const min = 60 * 1000;
    const hour = min * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = week * 30;
    const year = day * 365;

    const bodyTrunc = 97;
    const orgTrunc = 43;

    //Retrieve notifications from the backend
    const getNotifications = async () => {
        try {
            const url = `http://3.84.91.69:3000/${profile}/notifications`;
            const res = await fetch(url, {method: 'GET'});
            const json = await res.json();
            setNotifications(json.notifcations);
        }
        catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {getNotifications()}, []);

    function truncateText(text: string, maxLength: number) : string {
        if (text.length > maxLength) return text.substring(0, maxLength - 3) + "...";
        else return text;
    }

    //Yuckers
    function timeSinceCreation(toc: number) : string {
        let res : number = 0;
        let timeDiff : number = Date.now() - toc;

        if (timeDiff / min < 59) {
            res = Math.round(timeDiff / min);
            return res.toString() + "min ago";
        }
        else if (timeDiff / hour <= 24) {
            res = Math.round(timeDiff / hour);
            return res.toString() + "h ago";
        }
        else if (timeDiff / day < 7) {
            res = Math.round(timeDiff / day);
            return res.toString() + "d ago";
        }
        else if (timeDiff / week < 5) {
            res = Math.round(timeDiff / week);
            return res.toString() + "w ago";
        }
        else if (timeDiff / month < 12) {
            res = Math.round(timeDiff / month);
            return res.toString() + " mon ago";
        }
        else {
            res = Math.round(timeDiff / year);
            return res.toString() + "y";
        }
    }

    return (
        <View style={styles.container}>
            {/* Change this to use the notifications state variable */}
            <FlatList data={[
                { org : "Alachua County Library", 
                type : "New Event", 
                toc : 1741044839957, 
                body : "Weekly book organizing: Sort new books into the correct area" }, 
                { org : "Gator Alliance for World Health paddingssss", 
                    type : "New Event", 
                    toc : 1741044839957, 
                    body : "Weekly book organizing: Sort new books into the correct area asdfhsalkdfsadfgasdfasdfadsfhsakdfhdjaksjldhfjsaasasd" }]} 
                renderItem={({item}) => <TouchableOpacity style={styles.notification}>
                    {/*Left column*/}
                    <View style={styles.leftCol}>
                        <Text style={styles.org}>
                            {truncateText(item.org, orgTrunc)}
                        </Text>
                        <Text style={styles.body}>
                            {truncateText(item.body, bodyTrunc)}
                        </Text>
                    </View>
                    {/*Right column*/}
                    <View style={styles.rightCol}>
                        <Text style={styles.type}>
                            {item.type}
                        </Text>
                        <Text style={styles.toc}>
                            {timeSinceCreation(item.toc)}
                        </Text>
                    </View>
                </TouchableOpacity>
                }>

            </FlatList>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        flex: 1
    },
    notification: {
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        borderTopWidth: 1,
        borderTopColor: "gray",
        flexDirection: "row",
        marginVertical: 5,
        height: 70
    },
    leftCol: {
        flex: 4,
        flexDirection: "column",
        marginLeft: 5,
        justifyContent: "space-between",
        marginTop: 3,
        marginBottom: 3,
    },
    rightCol: {
        flex: 1,
        flexDirection: "column",
        marginRight: 5,
        justifyContent: "space-between",
        marginTop: 3,
        marginBottom: 3,
    },
    org: {
        fontWeight: "bold",
        color: "white",
        textAlign: "left",
        fontSize: 16,
        marginBottom: 2
    },
    type: {
        color: "white",
        textAlign: "right"
    },
    toc: {
        color: "gray",
        textAlign: "right"
    },
    body: {
        color: "white",
        textAlign: "left",
        fontSize: 14,
        marginTop: 2
    }
});

export default NotificationScreen;