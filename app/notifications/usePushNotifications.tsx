import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants"

import { Platform } from "react-native";
import { push } from "expo-router/build/global-state/routing";

export async function resgisterForPushNotificationAsync() {

    // Set the channel if the device is Android
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            lightColor: "FF231F7C"
        });
    }

    // Check that it's a real device
    if (Device.isDevice) {
        // Request notification permissions
        const {status: existingStatus} = await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
            
        if (finalStatus !== "granted") {
            throw new Error("Failed to get push token");
        }

        // Get project ID
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        if (!projectId) {
            throw new Error("Project ID not found");
        }

        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            // For testing purposes
            console.log(pushTokenString);
            return pushTokenString;
        }
        catch (err) {
            throw new Error(`${err}`);
        }
    }
    else {
        throw new Error("Must use a physical device to register for push notifications");
    }
}

// export interface PushNotificationState {
//     notification?: Notifications.Notification;
//     expoPushToken?: Notifications.ExpoPushToken;
// }

// export const usePushNotitifcations = (): PushNotificationState => {
//     Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//             shouldPlaySound: false,
//             shouldShowAlert: true,
//             shouldSetBadge: false
//         })
//     });

//     const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
//     const [notification, setNotification] = useState<Notifications.Notification | undefined>();

//     const notificationListener = useRef<Notifications.EventSubscription>();
//     const responseListener = useRef<Notifications.EventSubscription>();

//     async function resgisterForPushNotificationAsync() {
//         let token;

//         if (Device.isDevice) {
//             const {status: existingStatus} = await Notifications.getPermissionsAsync();

//             let finalStatus = existingStatus;

//             if (existingStatus !== "granted") {
//                 const {status} = await Notifications.requestPermissionsAsync();
//                 finalStatus = status;
//             }

//             if (finalStatus !== "granted") {
//                 alert("Failed to get push token");
//             }

//             token = await Notifications.getExpoPushTokenAsync({
//                 projectId: Constants.expoConfig?.extra?.eas?.projectID,
//             });

//             if (Platform.OS === "android") {
//                 Notifications.setNotificationChannelAsync("default", {
//                     name: "default",
//                     importance: Notifications.AndroidImportance.MAX,
//                     lightColor: "FF231F7C"
//                 })
//             }

//             return token;
//         }
//         else {
//             console.log("Not running on a physical device");
//         }
//     }

//     useEffect(() => {
//         resgisterForPushNotificationAsync().then((token) => {
//             setExpoPushToken(token);
//         })

//         notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
//             setNotification(notification);
//         });

//         responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
//             console.log(response);
//         });

//         return () => {
//             Notifications.removeNotificationSubscription(notificationListener.current!);
//             Notifications.removeNotificationSubscription(responseListener.current!);
//         }
//     }, []);

//     return {
//         expoPushToken,
//         notification
//     };
// }