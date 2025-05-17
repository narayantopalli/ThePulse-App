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
              onPress: () => router.push({pathname: "/camera", params: { path: "/(root)/(tabs)/profile" }})
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
    <View className="flex-1 bg-general-300">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          onPhotoPress={pickImage}
          userMetadata={userMetadata}
          isOwnProfile={true}
          profilePhotoURL={profilePhotoURL || undefined}
        />
        <ProfileBio isOwnProfile={true} />
        
        <View className="mt-4 mx-4 mb-32">
          <View className="flex-row items-center justify-between">
            <Text className="text-black text-2xl font-JakartaMedium">Current Status</Text>
            <View className="flex-1 items-end mr-4">
              <ChangeStatus />
            </View>
          </View>
          <Status 
            user_id={userMetadata?.id || ""} 
          />
        </View>
      </ScrollView>
    </View>
  );
}
