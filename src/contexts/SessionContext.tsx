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
import * as Linking from "expo-linking";
import { loadNotifications } from "@/utils/getNotifications";
import { loadGroupRequestsFromDatabase, loadGroupRequestsFromLocalStorage, loadMyGroupsFromDatabase } from "@/utils/loadGroups";
import { loadMyGroupsFromLocalStorage } from "@/utils/loadGroups";
import { getLocationString } from "@/hooks/getLocationString";

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
  setFeed: () => {},
  isAnonymous: false,
  setIsAnonymous: () => {},
  session: null,
  searchRadius: 5000,
  setSearchRadius: () => {},
  blockedPosts: [],
  setBlockedPosts: () => {},
  myPosts: [],
  setMyPosts: () => {},
  initialURL: null,
  notifications: [],
  setNotifications: () => {},
  myGroups: [],
  setMyGroups: () => {},
  channel: "",
  setChannel: () => {},
  forceAnonymous: false,
  setForceAnonymous: () => {},
  groupRequests: [],
  setGroupRequests: () => {},
  locationString: "",
  showVibe: false,
  setShowVibe: () => {},
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
  const [searchRadius, setSearchRadius] = useState<number>(4828);
  const [blockedPosts, setBlockedPosts] = useState<string[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [initialURL, setInitialURL] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [groupRequests, setGroupRequests] = useState<any[]>([]);
  const [channel, setChannel] = useState<string>('00000000-0000-0000-0000-000000000000');
  const [forceAnonymous, setForceAnonymous] = useState<boolean>(false);
  const [locationString, setLocationString] = useState<string>("Location not available");
  const [showVibe, setShowVibe] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('channel').then((channel) => {
      if (channel) setChannel(channel);
    });
    AsyncStorage.getItem('forceAnonymous').then((forceAnonymous) => {
      if (forceAnonymous) setForceAnonymous(forceAnonymous === 'true');
    });
    AsyncStorage.getItem('vibeLastShown').then(async (vibeLastShown) => {
      let diffDays = 1;
      const now = new Date();
      if (vibeLastShown) {
        const lastShown = new Date(vibeLastShown);
        const diffTime = Math.abs(now.getTime() - lastShown.getTime());
        diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
      if (diffDays > 0) setShowVibe(true);
      AsyncStorage.setItem('vibeLastShown', now.toISOString());

      // Update last active
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ last_active: now.toISOString() })
        .eq("id", userMetadata?.id);
      if (profileError) throw profileError;
      if (userMetadata) {
        setUserMetadata({...userMetadata, last_active: now.toISOString()});
      }
    });
  }, []);

  useEffect(() => {
    const fetchLocationString = async () => {
      if (location) {
        const locationStr = await getLocationString(location);
        setLocationString(locationStr);
      }
    };
    fetchLocationString();
  }, [location]);

  useEffect(() => {
    if (userMetadata?.id) {
      loadMyGroupsFromLocalStorage(userMetadata.id, setMyGroups);
      loadMyGroupsFromDatabase(userMetadata.id, setMyGroups);
      loadGroupRequestsFromLocalStorage(userMetadata.id, setGroupRequests);
      loadGroupRequestsFromDatabase(userMetadata.id, setGroupRequests);
    }
  }, [userMetadata?.id]);

  useEffect(() => {
    AsyncStorage.getItem('searchRadius').then((radius) => {
      if (radius) setSearchRadius(parseInt(radius));
    });
    AsyncStorage.getItem('blockedPosts').then((posts) => {
      if (posts) setBlockedPosts(JSON.parse(posts));
    });
    supabase.from('reports').select('post_id').eq('user_id', userMetadata?.id).not('post_id', 'is', null).then(({ data }) => {
      if (data) setBlockedPosts(data.map((post) => post.post_id));
      AsyncStorage.setItem('blockedPosts', JSON.stringify(blockedPosts));
    });
  }, []);

  useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      setInitialURL(url);
    };
    getInitialURL();
  }, []);

  useEffect(() => {
    const loadMyPostsFromDatabase = async () => {
      if (!userMetadata?.id) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userMetadata?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const postsWithImage = await Promise.all(
          data.map(async (post) => ({
            ...post,
            image_url: post.data.image_url ? await getLocalImageURI(post.data.image_url) : null
          }))
        );
        setMyPosts(postsWithImage);
        if (userMetadata?.id) {
          await AsyncStorage.setItem(`my_posts_${userMetadata.id}`, JSON.stringify(postsWithImage));
        }
      }
    }
    const loadMyPostsFromLocalStorage = async () => {
      if (userMetadata?.id) {
        try {
          const storedPosts = await AsyncStorage.getItem(`my_posts_${userMetadata.id}`);
          if (storedPosts) {
            setMyPosts(JSON.parse(storedPosts));
          }
        } catch (error) {
          console.error('Error reading from local storage:', error);
        }
      }
    };
    loadMyPostsFromLocalStorage();
    loadMyPostsFromDatabase();
  }, [location, userMetadata]);

  const getFeedFromLocalStorage = async (): Promise<any[]> => {
    if (userMetadata?.id) {
      const storedFeed = await AsyncStorage.getItem(`feed_${channel}_${userMetadata.id}`);
      if (storedFeed) {
        return JSON.parse(storedFeed);
      }
    }
    return [];
  }

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;
    (async () => {
      setFeed(await getFeedFromLocalStorage());
      const { status } = await requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
      } else {
        locationSubscription = await watchPositionAsync({
          accuracy: Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 10,
        }, (location) => {
          console.log("location:", {latitude: location.coords.latitude, longitude: location.coords.longitude});
          setLocation([location.coords.latitude, location.coords.longitude])
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
      console.log("Profile updated!");
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
        AsyncStorage.setItem(uri, localPath || ""); // persist
      })
      .catch(console.error);

    // Update user profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: uri })
      .eq('id', userMetadata.id);
    if (profileErr) return console.error(profileErr);
  };

  useEffect(() => {
    if (forceAnonymous) {
      setIsAnonymous(true);
    }
  }, [forceAnonymous]);

  useEffect(() => {
    if (userMetadata?.id) {
      loadNotifications(userMetadata, setNotifications);
    }
  }, [userMetadata?.id]);

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
        setFeed,
        isAnonymous,
        setIsAnonymous,
        session,
        searchRadius,
        setSearchRadius,
        blockedPosts,
        setBlockedPosts,
        myPosts,
        setMyPosts,
        initialURL,
        notifications,
        setNotifications,
        myGroups,
        setMyGroups,
        channel,
        setChannel,
        forceAnonymous,
        setForceAnonymous,
        groupRequests,
        setGroupRequests,
        locationString,
        showVibe,
        setShowVibe,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
