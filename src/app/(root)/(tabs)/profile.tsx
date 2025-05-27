import { View, ScrollView, Alert, Keyboard, Text } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import Status from "@/components/status";
import ChangeStatus from "@/components/buttons/changeStatus";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile() {
  const { userMetadata, loading, updateProfilePhoto, profilePhotoURL } = useSession();
  const params = useLocalSearchParams<{ newPhotoUri?: string }>();

  useEffect(() => {
    if (params?.newPhotoUri && userMetadata?.id) {
      updateProfilePhoto({
        canceled: false,
        assets: [
          {
            uri: params.newPhotoUri,
            width: 1,
            height: 1,
            type: "image",
          },
        ],
      } as any);
    }
  }, [params?.newPhotoUri]);

  const pickImage = async () => {
    Keyboard.dismiss();
    
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus === 'granted' && libraryStatus === 'granted') {
      const source = await new Promise(resolve => {
        Alert.alert(
          "Choose Photo Source",
          "Would you like to take a new photo or choose from your library?",
          [
            {
              text: "Camera",
              onPress: () => router.push({pathname: "(root)/camera", params: { path: "/(root)/(tabs)/profile" }})
            },
            {
              text: "Photo Library", 
              onPress: () => resolve("library")
            }
          ]
        );
      });

      if (source === "library") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
          exif: false,
        });

        if (!result.canceled && userMetadata?.id) {
          updateProfilePhoto(result);
        }
      }
    } else {
      Alert.alert("Permission Required", "Camera and photo library permissions are required to use this feature");
    }
  };

  if (loading) return null;

  return (
    <View className="flex-1 bg-gradient-to-b from-general-300 to-general-200">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <ProfileHeader 
          onPhotoPress={pickImage}
          userMetadata={userMetadata}
          isOwnProfile={true}
          profilePhotoURL={profilePhotoURL || undefined}
        />
        <ProfileBio isOwnProfile={true} />
        
        {/* Status Section */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="bg-white/80 p-1.5 rounded-full">
                <MaterialCommunityIcons name="heart-pulse" size={22} color="#000" />
              </View>
              <Text className="text-black text-lg font-JakartaBold ml-2">Current Status</Text>
            </View>
            <ChangeStatus />
          </View>
          <View className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-sm border border-gray-100">
            <Status 
              user_id={userMetadata?.id || ""} 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
