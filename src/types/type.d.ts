// User Types
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  birthday: string;
  gender: string;
  bio: string;
  avatar_url: string;
  last_posted: string;
}

export interface UserMetadata {
  id: string;
  firstname: string;
  lastname: string;
  birthday: string;
  gender: string;
  bio: string;
  avatar_url: string;
  last_posted: string;
}

// Post Types
export type PostType = 'text' | 'poll' | 'response';

interface Post {
  id: string;
  user_id: string;
  created_at: string;
  data: {
    type: "text" | "poll" | "response";
    image_url?: string;
    post_data: {
      caption: string;
      options?: string[];
    };
  };
  user_data: {
    username: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
  liked: boolean;
  anonymous: boolean;
  location_string: string;
  latitude: number;
  longitude: number;
}

export interface FeedPost {
  id: string;
  data: {
    type: PostType;
    [key: string]: any;
  };
}

// Component Props Types
export interface ButtonProps {
  onPress: () => void;
  title: string;
  bgVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  textVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
}

export interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  className?: string;
}

export interface ErrorMessageProps {
  message: string;
}

export interface StatusProps {
  user_id: string;
}

// Post Component Props
export interface PostUploaderProps {
  postPhoto: string | null;
  postType: PostType;
  caption: string;
  pollOptions?: string[];
  location: [number, number] | null;
  visibilityDistance: number | null;
  userMetadata: any;
  setUserMetadata: (metadata: any) => void;
  onError: (message: string) => void;
  postAnonymous: boolean;
}

export interface TextPostProps {
  text: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export interface PollPostProps {
  question: string;
  options: string[];
  onQuestionChange: (text: string) => void;
  onOptionsChange: (options: string[]) => void;
}

export interface ResponsePostProps {
  prompt: string;
  onPromptChange: (text: string) => void;
  placeholder?: string;
}

export interface PhotoPostProps {
  imageUri: string;
  onRemove?: () => void;
}

export interface VisibilitySelectorProps {
  sliderValue: number;
  onSliderValueChange: (value: number) => void;
  postAnonymous: boolean;
  setPostAnonymous: (anonymous: boolean) => void;
}

// Feed Component Props
interface FeedItemProps {
  onFocus: (rowId: string) => void;
  inputRefs: React.RefObject<Record<string, TextInput | null>>;
  post: {
    id: string;
    user_id: string;
    created_at: string;
    data: {
      type: 'text' | 'poll' | 'response';
      image_url?: string;
      post_data: {
        caption: string;
        options?: string[];
      };
    };
    user_data: any;
    visibility_radius?: number | null;
    location_string: string;
    latitude: number;
    longitude: number;
    anonymous: boolean;
  };
}

export interface TextPostContentProps {
  postId: string;
  user_id: string;
  caption: string;
}

export interface PollPostContentProps {
  postId: string;
  user_id: string;
  caption: string;
  options: string[];
}

export interface ResponsePostContentProps {
  caption: string;
  user_id: string;
  postId: string;
  inputRefs: React.RefObject<Record<string, TextInput | null>>;
  onFocus: (rowId: string) => void;
}

// Map Component Props
export interface Hotspot {
  latitude: number;
  longitude: number;
  strength: number;
}

export interface CustomMapViewProps {
  region: Region | null;
  location: LocationObject | null;
}

export interface HotspotMarkersProps {
  hotspots: Hotspot[];
}

export interface ResetLocationButtonProps {
  onPress: () => void;
}

// Profile Component Props
export interface ProfileHeaderProps {
  onPhotoPress?: () => void;
  isOwnProfile?: boolean;
  profilePhotoURL?: string;
  friendButton?: React.ReactNode;
  userMetadata?: UserMetadata | null;
}

export interface ProfileBioProps {
  bio?: string;
  isOwnProfile?: boolean;
}

// Notification Types
export interface NotificationItemProps {
  item: any;
  onIgnore: (id: string) => void;
  currentUserId: string;
}

// Poll Types
export interface PollVote {
  id: string;
  option_index: number;
  created_at: string;
  anonymous: boolean;
  user_data: {
    firstname: string;
    lastname: string;
    avatar_url?: string;
  } | null;
}

// Response Types
export interface Responses {
  id: string;
  created_at: string;
  post_id: string;
  anonymous: boolean;
  response: string;
  user_data: UserData | null;
};

// Session Context Types
interface SessionContextType {
  userMetadata: UserMetadata | null;
  setUserMetadata: any;
  loading: boolean;
  profilePhotoURL: string | null;      // file://… (local) or null
  updateProfilePhoto: (res: ImagePickerSuccessResult) => Promise<void>;
  location: [number, number] | null;
  feed: any[];
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  session: any;
}

// Friendship Types
export type FriendshipStatus = 0 | 1 | 2;

// Camera Types
export interface CameraProps {
  type?: 'front' | 'back';
  flashMode?: 'off' | 'on' | 'auto' | 'torch';
  ratio?: string;
  ref?: any;
}

// AI Component Props
export interface AIButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// Header Component Props
export interface SharedHeaderTabsProps {
  title?: string;
  whichIcon?: number;
  showLocation?: boolean;
}
