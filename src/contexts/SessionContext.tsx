import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagePickerSuccessResult } from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { cacheImage, getLocalImageURI } from "@/utils/getImage";
import * as Location from 'expo-location';
import * as MediaLibrary from "expo-media-library";
import { requestForegroundPermissionsAsync } from "expo-location";
import { watchPositionAsync } from "expo-location";
import { Accuracy } from "expo-location";
import { SessionContextType, UserMetadata } from "@/types/type";

const BUCKET           = "images";   // storage bucket
const STORAGE_KEY      = "LOCAL_AVATAR_PATH";

const SessionContext = createContext<SessionContextType>({
  userMetadata: null,
  setUserMetadata: null,
  loading: true,
  profilePhotoURL: null,
  updateProfilePhoto: async () => {},
  location: null,
  feed: [],
  isAnonymous: false,
  setIsAnonymous: () => {},
  session: null,
  searchRadius: 5000,
  setSearchRadius: () => {},
  blockedPosts: [],
  setBlockedPosts: () => {},
});

export const useSession = () => useContext(SessionContext);

interface Props {
  children: ReactNode;
}

export const SessionProvider = ({ children }: Props) => {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const [loading, setLoading]           = useState(true);
  const [profilePhotoURL, setPhotoURL]  = useState<string | null>(null);
  const [location, setLocation]         = useState<[number, number] | null>(null);
  const [feed, setFeed]                 = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous]   = useState(false);
  const [session, setSession]           = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5000);
  const [blockedPosts, setBlockedPosts] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('searchRadius').then((radius) => {
      if (radius) setSearchRadius(parseInt(radius));
    });
    AsyncStorage.getItem('blockedPosts').then((posts) => {
      if (posts) setBlockedPosts(JSON.parse(posts));
    });
    supabase.from('reports').select('post_id').eq('user_id', userMetadata?.id).then(({ data }) => {
      if (data) setBlockedPosts(data.map((post) => post.post_id));
      AsyncStorage.setItem('blockedPosts', JSON.stringify(blockedPosts));
    });
  }, []);

  const getFeed = async (lat: number, lon: number) => {
    try {
      const { data: FeedData, error: FeedDataError } = await supabase.rpc('get_posts', {
        p_lon: lon,
        p_lat: lat,
        p_rad: searchRadius
      });
      if (FeedDataError) throw FeedDataError;

      const userIDs = FeedData.map((post: any) => post.user_id);

      const { data: UserData, error: UserDataError } = await supabase.from('profiles')
        .select('id, avatar_url, firstname, lastname')
        .in('id', userIDs);

      const feedWithUserData = await Promise.all(FeedData.map(async (post: any) => {
        const userData = (UserData || []).find((user: any) => user.id === post.user_id);
        let imageUrl = null;
        if (post.data.image_url) {
          imageUrl = await getLocalImageURI(post.data.image_url);
        }
        let avatarUrl = null;
        if (userData) {
          avatarUrl = await getLocalImageURI(userData.avatar_url);
        }
        return {
          ...post,
          data: {
            ...post.data,
            image_url: post.data.image_url ? imageUrl : null
          },
          user_data: {
            ...userData,
            avatar_url: avatarUrl
          }
        };
      }));

      // remove blocked posts from feed
      const feedWithoutBlockedPosts = feedWithUserData.filter((post) => !blockedPosts.includes(post.id));

      // Sort feed by created_at in descending order (newest first)
      const sortedFeed = feedWithoutBlockedPosts
        .filter((post): post is NonNullable<typeof post> => post !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFeed(sortedFeed);
      if (userMetadata?.id) {
        AsyncStorage.setItem(`feed_${userMetadata.id}`, JSON.stringify(sortedFeed));
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  }

  const getFeedFromLocalStorage = async () => {
    if (userMetadata?.id) {
      const storedFeed = await AsyncStorage.getItem(`feed_${userMetadata.id}`);
      const filteredFeed = (JSON.parse(storedFeed || '[]') as any[]).filter((post) => !blockedPosts.includes(post.id));
      setFeed(filteredFeed);
    }
  }

  useEffect(() => {
    getFeedFromLocalStorage();
  }, [blockedPosts])

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    getFeedFromLocalStorage();
    (async () => {
      const { status } = await requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
      } else {
        locationSubscription = await watchPositionAsync({
          accuracy: Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 10,
        }, (location) => {
          console.log("location:", location);
          console.log("refreshed feed", feed);
          setLocation([location.coords.latitude, location.coords.longitude])
          getFeed(location.coords.latitude, location.coords.longitude);
        })
      }
    })();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
    }
  }, [userMetadata, searchRadius])

  // Load from local storage on cold start
  useEffect(() => {
    AsyncStorage.getItem("SESSION").then((session) => {
      if (session) setSession(JSON.parse(session));
    });
    AsyncStorage.getItem("USER_METADATA").then((metadata) => {
      if (metadata) setUserMetadata(JSON.parse(metadata));
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setSession(session);
        getMetadata(session.user.id);
        setLoading(false);
        // Load profile photo from storage
        AsyncStorage.getItem(STORAGE_KEY).then((path) => {
          if (path) setPhotoURL(path);
        });
      }
    });
  }, []);

  // Subscribe to auth changes and update user metadata
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        if (session?.user?.id) {
          setSession(session);
          getMetadata(session.user.id);
          setLoading(false);
        } else {
          console.log("User logged out");
          setUserMetadata(null);
          setSession(null);
          AsyncStorage.removeItem("USER_METADATA");
          // Clear local storage on logout
          AsyncStorage.removeItem(STORAGE_KEY);
          setPhotoURL(null);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array since we want this to run once and maintain subscription

  // Download avatar from storage to local storage when userMetadata changes
  useEffect(() => {
    if (!userMetadata?.id) return;

    (async () => {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userMetadata.id);

      const key = userData?.[0]?.avatar_url as string | undefined;
      if (!key) return;
      
      const path = await getLocalImageURI(key);
      if (path) setPhotoURL(path);
    })();
  }, [userMetadata]);

  // Function to get user metadata from supabase
  const getMetadata = async (user_id: string) => {
    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();
  
    if (error) {
      console.error('Error fetching profile:', error);
      setUserMetadata(null);
    } else if (profile) {
      console.log("Profile updated:", profile);
      setUserMetadata(profile);
    }
    AsyncStorage.setItem("USER_METADATA", JSON.stringify(profile));
  }

  // Function to update user profile photo in storage to new image
  const updateProfilePhoto = async(res: ImagePickerSuccessResult) => {
    if (!userMetadata?.id) return;

    const img   = res.assets[0];
    const ext   = img.uri.split(".").pop() ?? "jpg";
    const uri   = `avatars/${userMetadata.id}.${ext}`;       // bucket key

    // Save to photos first
    await MediaLibrary.saveToLibraryAsync(img.uri);

    const base64 = await FileSystem.readAsStringAsync(img.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const buffer = decode(base64);

    setPhotoURL(uri);
    if (uri) AsyncStorage.setItem(STORAGE_KEY, uri);
    else     AsyncStorage.removeItem(STORAGE_KEY);
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(uri, buffer, { contentType: `image/${ext}`, upsert: true });
    if (uploadErr) return console.error(uploadErr);

    await cacheImage(uri).then((localPath) => {
        setPhotoURL(localPath);
        AsyncStorage.setItem(uri, localPath); // persist
      })
      .catch(console.error);

    // Update user profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: uri })
      .eq('id', userMetadata.id);
    if (profileErr) return console.error(profileErr);
  };

  return (
    <SessionContext.Provider
      value={{ 
        userMetadata, 
        setUserMetadata, 
        loading, 
        profilePhotoURL, 
        updateProfilePhoto, 
        location, 
        feed,
        isAnonymous,
        setIsAnonymous,
        session,
        searchRadius,
        setSearchRadius,
        blockedPosts,
        setBlockedPosts
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
