import { View, ScrollView, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { getLocalImageURI } from "@/utils/getImage";
import Status from "@/components/status";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BackButton from "@/components/buttons/backButton";
import SmallProfilePhoto from "@/components/smallProfilePhoto";

const PublicProfile = () => {
  const { userID } = useLocalSearchParams<{ userID: string }>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
    <View className="flex-1 bg-gradient-to-b from-general-300 to-general-200">
      <View className="flex flex-row justify-between items-center bg-white px-4 h-14 shadow-sm">
        <BackButton onPress={() => router.back()} />
        <View className="rounded-full overflow-hidden">
          <SmallProfilePhoto />
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <ProfileHeader 
          userMetadata={{
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            birthday: user.birthday,
            pronouns: user.pronouns,
            last_active: user.last_active,  
            avatar_url: user.avatar_url,
            bio: user.bio,
            words_left: user.words_left,
            current_score: 0,
            current_ranking: 0
          }}
          profilePhotoURL={localProfilePhotoURL}
          isOwnProfile={false}
        />
        
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="bg-white/80 p-1.5 rounded-full">
                <MaterialCommunityIcons name="heart-pulse" size={22} color="#000" />
              </View>
              <Text className="text-black text-lg font-JakartaBold ml-2">Current Status</Text>
            </View>
          </View>
          <View className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-sm border border-gray-100">
            <Status 
              user_id={userID} 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default PublicProfile;
