import { Text, View, TouchableOpacity } from "react-native";
import ProfilePhoto from "@/components/profilePhoto";
import { calculateAge } from "@/constants";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileHeaderProps } from "@/types/type";

const ProfileHeader = ({ 
  onPhotoPress, 
  userMetadata,
  isOwnProfile = false,
  profilePhotoURL,
}: ProfileHeaderProps) => {

  const photoURL = profilePhotoURL;   
  
  const age = userMetadata?.birthday 
    ? calculateAge(userMetadata.birthday)
    : null;

  const formatLastActive = (lastPosted?: string) => {
    if (!lastPosted) return "N/A";
    
    const lastActive = new Date(lastPosted);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <View className="flex-row">
      {/* Avatar */}
      <TouchableOpacity 
        className="mt-12 ml-8" 
        onPress={onPhotoPress}
        disabled={!onPhotoPress}
      >
        <ProfilePhoto radius={80} profilePhotoURL={photoURL || ''} />
      </TouchableOpacity>

      {/* Personal Information */}
      <View className="flex-1 items-left mt-14 ml-8">
        <Text className="text-grey-500 text-2xl font-JakartaMedium mt-2">
          {`Last Active: ${formatLastActive(userMetadata?.last_posted)}`}
        </Text>
        <Text className="text-grey-500 text-2xl font-JakartaMedium mt-2">
          {`${userMetadata?.firstname || ''} ${userMetadata?.lastname || ''}`}
        </Text>
        <Text className="text-grey-500 text-2xl font-JakartaMedium mt-2">
          {age ? `${age}` : ''}
        </Text>
        <Text className="text-grey-500 text-2xl font-JakartaMedium mt-2">
          {userMetadata?.gender ? `${userMetadata.gender}` : ''}
        </Text>
        {/*Button to view own posts*/}
        {isOwnProfile && (
          <TouchableOpacity 
            onPress={() => router.push('/(root)/my-posts')}
            className="mt-4 bg-emerald-500 px-2 py-2 rounded-lg active:bg-emerald-500 flex-row items-center self-start"
          >
            <MaterialCommunityIcons name="post-outline" size={20} color="black" />
            <Text className="text-black text-m font-JakartaBold text-center ml-1">
              View My Posts
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
