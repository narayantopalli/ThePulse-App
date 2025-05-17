import * as FileSystem from 'expo-file-system';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BUCKET = "images";
const SIGNED_URL_TTL = 60;

/* ───────────────────────────────────────────────────────────── */
/*  Helper: fetch ➜ cache ➜ return local URI                    */
/* ───────────────────────────────────────────────────────────── */
export const cacheImage = async (key: string): Promise<string> => {
    const localPath = `${FileSystem.cacheDirectory}${key.replace(/\//g, "_")}`;

    // 1. Create short‑lived URL
    const { data, error } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(key, SIGNED_URL_TTL);

    if (error || !data?.signedUrl) {
        throw error ?? new Error("No signed URL");
    }

    // 2. Download to cache dir
    await FileSystem.downloadAsync(data.signedUrl, localPath);
    return localPath;
};

export const getLocalImageURI = async (key: string): Promise<string | null> => {
  if (!key) return null;
  
  try {
    const localPath = await cacheImage(key);
    await AsyncStorage.setItem(key, localPath);
    return localPath;
  } catch (error) {
    console.error(error);
    return null;
  }
};
