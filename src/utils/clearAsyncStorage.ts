import AsyncStorage from "@react-native-async-storage/async-storage";

const clearAsyncStorage = async (user_id: string) => {
    try {
        // Clear user-specific data
        await AsyncStorage.removeItem(`feed_${user_id}`);
        await AsyncStorage.removeItem(`my_posts_${user_id}`);
        await AsyncStorage.removeItem(`notifications_${user_id}`);
        await AsyncStorage.removeItem(`status_${user_id}`);
        // Clear general app data
        await AsyncStorage.removeItem("USER_METADATA");
        await AsyncStorage.removeItem("SESSION");
        await AsyncStorage.removeItem("LOCAL_AVATAR_PATH");
        await AsyncStorage.removeItem("searchRadius");
        await AsyncStorage.removeItem("blockedPosts");
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
    }
};

export default clearAsyncStorage;
