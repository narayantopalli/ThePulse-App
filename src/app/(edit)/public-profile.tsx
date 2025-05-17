import { View, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/utils/supabase";
import { getLocalImageURI } from "@/utils/getImage";
import Status from "@/components/status";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";

type FriendshipStatus = 0 | 1 | 2;

export default function PublicProfile() {
  const { userID } = useLocalSearchParams<{ userID: string }>();
  const { userMetadata } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFriend, setIsFriend] = useState<FriendshipStatus>(0);
  const [isSender, setIsSender] = useState<boolean>(false);
  const [friendshipId, setFriendshipId] = useState("");
  const [data, setData] = useState<any>(null);
  const [localProfilePhotoURL, setLocalProfilePhotoURL] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase  
          .from('profiles')
          .select('*')
          .eq('id', userID);
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        getLocalImageURI(data[0].avatar_url).then((url) => {
          setLocalProfilePhotoURL(url || '');
        });
        
        if (data && data.length > 0) {
          setUser(data[0]);
        }
      } catch (err) {
        console.error('Error in fetchUser:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userID]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <View className="flex-1 bg-general-300 items-center justify-center">
        <Text className="text-black text-xl font-JakartaMedium">User not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-general-600">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          userMetadata={{
            firstname: user.firstname,
            lastname: user.lastname,
            birthday: user.birthday,
            gender: user.gender,
            last_posted: user.last_posted,
            avatar_url: user.avatar_url
          }}
          profilePhotoURL={localProfilePhotoURL}
          isOwnProfile={false}
        />
        
        <ProfileBio 
          bio={user.bio}
          isOwnProfile={false}
        />
        
        <View className="mt-4 mx-4 mb-32">
          <View className="flex-row items-center justify-between">
            <Text className="text-black text-2xl font-JakartaMedium">Current Status</Text>
          </View>
          <Status 
            user_id={userID} 
          />
        </View>
      </ScrollView>
    </View>
  );
}
