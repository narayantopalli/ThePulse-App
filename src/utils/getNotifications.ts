import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalImageURI } from '@/utils/getImage';
import { UserMetadata } from '@/types/type';

export const loadNotifications = async (userMetadata: UserMetadata, setNotifications: (value: any[]) => void) => {
    try {
        const storedNotifications = await AsyncStorage.getItem(`notifications_${userMetadata?.id}`);
        if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
        }
        fetchNotifications(userMetadata, setNotifications);
    } catch (error) {
        console.error('Error reading from local storage:', error);
    }
};

export const fetchNotifications = async (userMetadata: UserMetadata, setNotifications: (value: any[]) => void) => {
    try {
        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userMetadata?.id)
        .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;

        // Process notifications
        const processedNotifications = await Promise.all(
            notificationsData.map(async (notification) => {
                const { data: senderData, error: senderError } = await supabase
                    .from('profiles')
                    .select('firstname, lastname, avatar_url')
                    .eq('id', notification.sender_id)
                    .maybeSingle();

                    notification.sender = null;
                if (!senderError && senderData) {
                    notification.sender = senderData;
                    notification.sender.avatar_url = await getLocalImageURI(notification.sender.avatar_url);
                } else if (senderError) {
                    console.error('Error fetching sender data:', senderError);
                }
                return notification;
            })
        );

        setNotifications(processedNotifications);
        await AsyncStorage.setItem(`notifications_${userMetadata?.id}`, JSON.stringify(processedNotifications));
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

export const handleIgnore = async (notificationId: string, notifications: any[], setNotifications: (value: any[]) => void) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);
        
        if (error) throw error;

        // Remove the notification from local state
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};
