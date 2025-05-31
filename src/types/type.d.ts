// User Types
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  birthday: string;
  pronouns: string;
  bio: string;
  avatar_url: string;
  last_active: string;
}

export interface UserMetadata {
  id: string;
  firstname: string;
  lastname: string;
  birthday: string;
  pronouns: string;
  bio: string;
  avatar_url: string;
  last_active: string;
  words_left: number;
  current_score: number;
  current_ranking: number;
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
  IconLeft?: () => React.ReactNode;
  IconRight?: () => React.ReactNode;
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
  channel: string;
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
  forceAnonymous?: boolean;
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
  setRegion: (region: Region) => void;
  location: LocationObject | null;
  hotspots: Hotspot[];
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
  setFeed: (value: any[]) => void;
  isAnonymous: boolean;
  setIsAnonymous: (value: boolean) => void;
  session: any;
  searchRadius: number;
  setSearchRadius: (value: number) => void;
  blockedPosts: string[];
  setBlockedPosts: (value: string[]) => void;
  myPosts: any[];
  setMyPosts: (value: any[]) => void;
  initialURL: string | null;
  notifications: any[];
  setNotifications: (value: any[]) => void;
  myGroups: any[];
  setMyGroups: (value: any[]) => void;
  channel: string;
  setChannel: (value: string) => void;
  forceAnonymous: boolean;
  setForceAnonymous: (value: boolean) => void;
  groupRequests: any[];
  setGroupRequests: (value: any[]) => void;
  locationString: string;
  showVibe: boolean;
  setShowVibe: (value: boolean) => void;
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
  isDarkMode?: boolean;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  size: number;
  created_at: string;
  anonymous: boolean;
  private: boolean;
  avatar_url?: string;
}

export interface GroupMember {
  id: string;
  firstname: string;
  lastname: string;
  avatar_url: string;
}

export interface GroupItemProps {
  item: Group;
  isMember: boolean;
  isRequestingJoin: boolean;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string, isRequestingJoin: boolean) => void;
  onShowMembers: (group: Group) => void;
  numRequests: number;
  setNumRequests: (value: number | ((prev: number) => number)) => void;
}

export interface SearchResultsProps {
  groups: Group[];
  users: User[];
  onEndReached: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  groupRequests: Group[];
  setGroupRequests: (value: Group[]) => void;
  showCreateButton?: boolean;
}

export interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: (newGroup: any) => void;
  numRequests?: number;
}

export interface GroupDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group | null;
  numRequests?: number;
  setNumRequests: (value: number) => void;
}

export interface GroupMember {
  id: string;
  firstname: string;
  lastname: string;
  avatar_url: string;
}

export interface GroupListHeaderProps {
  onCreatePress: () => void;
}
