import React, {createContext, useContext, useState, useEffect, useRef, ReactNode} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import { resgisterForPushNotificationAsync } from "./usePushNotifications";

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new Error("useNotification must be used within a notification provider");
    }

    return context;
}

interface NotificationProviderProps {
    children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        resgisterForPushNotificationAsync().then(
            (token) => setExpoPushToken(token),
            (error) => setError(error)
        );

        // Called whenever a notification is received while the app is running
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received: ", JSON.stringify(notification, null, 2));
            setNotification(notification);
        })

        // Called whenever a user interacts with a notification (e.g. tapping on it)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response: ", JSON.stringify(response, null, 2), JSON.stringify(response.notification.request.content.data, null, 2));
            // Handle responding to the notification
        })

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
    
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
            {children}
        </NotificationContext.Provider>
    )
}