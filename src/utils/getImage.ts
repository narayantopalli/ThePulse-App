import * as FileSystem from 'expo-file-system';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BUCKET = "images";
const SIGNED_URL_TTL = 60;

/* ───────────────────────────────────────────────────────────── */
/*  Helper: fetch ➜ cache ➜ return local URI                    */
/* ───────────────────────────────────────────────────────────── */
export const cacheImage = async (key: string): Promise<string | null> => {
    const localPath = `${FileSystem.cacheDirectory}${key.replace(/\//g, "_")}`;

    try {
        // Check if file exists in storage
        const { data: exists } = await supabase
            .storage
            .from(BUCKET)
            .list(key.split('/').slice(0, -1).join('/'));

        const fileName = key.split('/').pop();
        if (!exists?.some(file => file.name === fileName)) {
            console.log(`File ${key} does not exist in storage`);
            return null;
        }

        // 1. Create short‑lived URL
        const { data, error } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrl(key, SIGNED_URL_TTL);

        if (error || !data?.signedUrl) {
            console.log(`Error creating signed URL for ${key}:`, error);
            return null;
        }

        // 2. Download to cache dir
        await FileSystem.downloadAsync(data.signedUrl, localPath);
        return localPath;
    } catch (error) {
        console.log(`Error caching image ${key}:`, error);
        return null;
    }
};

export const getLocalImageURI = async (key: string): Promise<string | null> => {
  if (!key) return null;
  
  try {
    const localPath = await cacheImage(key);
    if (localPath) {
      await AsyncStorage.setItem(key, localPath);
      return localPath;
    }
    return null;
  } catch (error) {
    console.error('Error in getLocalImageURI:', error);
    return null;
  }
};
