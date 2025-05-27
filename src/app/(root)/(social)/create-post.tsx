import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Keyboard, ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import PhotoPost from "@/components/post/PhotoPost";
import TextPost from "@/components/post/TextPost";
import PollPost from "@/components/post/PollPost";
import ResponsePost from "@/components/post/ResponsePost";
import ErrorMessage from "@/components/ErrorMessage";
import VisibilitySelector from "@/components/post/VisibilitySelector";
import PostUploader from "@/components/post/PostUploader";
import BackButton from "@/components/buttons/backButton";
import * as ImagePicker from 'expo-image-picker';
import SmallProfilePhoto from "@/components/smallProfilePhoto";

type PostType = 'text' | 'poll' | 'response';

const CreatePost = () => {
  const { newPhotoUri } = useLocalSearchParams();
  const { userMetadata, setUserMetadata, location, isAnonymous, channel, forceAnonymous } = useSession();
  const [postPhoto, setPostPhoto] = useState<string | null>(newPhotoUri ? newPhotoUri as string : null);
  const [postType, setPostType] = useState<PostType>('text');
  const [caption, setCaption] = useState("");
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [visibilityDistance, setVisibilityDistance] = useState<number>(4828);
  const [postAnonymous, setPostAnonymous] = useState<boolean>(isAnonymous);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    setErrorMessage("");
  }, [postType, caption]);

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
              onPress: () => router.push({pathname: "/(root)/camera", params: { path: "/(root)/(social)/create-post" }})
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
          aspect: [3, 4],
          quality: 0.9,
          exif: false,
        });

        if (!result.canceled && userMetadata?.id) {
          setPostPhoto(result.assets[0].uri);
        }
      }
    } else {
      setErrorMessage("Camera and photo library permissions are required to use this feature");
    }
  };

  const renderPostContent = () => {
    switch (postType) {
      case 'text':
        return (
          <TextPost 
            text={caption} 
            onChangeText={setCaption} 
            ref={(el) => { inputRefs.current['text'] = el; }}
          />
        );
      case 'poll':
        return (
          <PollPost 
            question={caption}
            options={pollOptions}
            onQuestionChange={setCaption}
            onOptionsChange={setPollOptions}
            ref={(el) => { inputRefs.current['poll'] = el; }}
          />
        );
      case 'response':
        return (
          <ResponsePost 
            prompt={caption}
            onPromptChange={setCaption}
            ref={(el) => { inputRefs.current['response'] = el; }}
          />
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex flex-row justify-between items-center bg-white px-4 h-14 shadow-sm">
        <BackButton onPress={() => router.replace("/(root)/(tabs)/home")} />
        <Text className="text-xl font-JakartaBold flex-1 text-center">Create Post</Text>
          <View className="border-2 border-black rounded-full overflow-hidden">
            <SmallProfilePhoto isAnonymous={postAnonymous}/>
          </View>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="flex-1 mx-4 mt-6 pb-12">
            {errorMessage && <ErrorMessage message={errorMessage} />}
            
            <View className="bg-white rounded-3xl shadow-sm mb-6 overflow-hidden border-2 border-yellow-500">
              <View className="flex-row items-center justify-between p-1">
                <TouchableOpacity 
                  onPress={pickImage}
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-2xl ${
                    postPhoto ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <FontAwesome6 name="image" size={18} color={postPhoto ? "#3B82F6" : "#6B7280"} />
                  <Text className={`font-JakartaMedium text-sm ml-2 ${postPhoto ? 'text-blue-600' : 'text-gray-600'}`}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setPostType('text')}
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-2xl mx-1 ${
                    postType === 'text' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <FontAwesome6 name="pen" size={18} color={postType === 'text' ? "#3B82F6" : "#6B7280"} />
                  <Text className={`font-JakartaMedium text-sm ml-2 ${postType === 'text' ? 'text-blue-600' : 'text-gray-600'}`}>Text</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setPostType('poll')}
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-2xl mx-1 ${
                    postType === 'poll' ? 'bg-purple-50' : 'bg-gray-50'
                  }`}
                >
                  <FontAwesome6 name="chart-simple" size={18} color={postType === 'poll' ? "#9333EA" : "#6B7280"} />
                  <Text className={`font-JakartaMedium text-sm ml-2 ${postType === 'poll' ? 'text-purple-600' : 'text-gray-600'}`}>Poll</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setPostType('response')}
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-2xl ${
                    postType === 'response' ? 'bg-amber-50' : 'bg-gray-50'
                  }`}
                >
                  <FontAwesome6 name="comments" size={18} color={postType === 'response' ? "#D97706" : "#6B7280"} />
                  <Text className={`font-JakartaMedium text-sm ml-2 ${postType === 'response' ? 'text-amber-600' : 'text-gray-600'}`}>Response</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-white rounded-3xl shadow-sm p-4 mb-6">
              {postPhoto && <PhotoPost imageUri={postPhoto} onRemove={() => setPostPhoto(null)} />}
              {renderPostContent()}
            </View>

            <View className="bg-white rounded-3xl shadow-sm p-4">
              <VisibilitySelector 
                sliderValue={visibilityDistance}
                onSliderValueChange={setVisibilityDistance}
                postAnonymous={postAnonymous}
                setPostAnonymous={setPostAnonymous}
                forceAnonymous={forceAnonymous}
              />

              <PostUploader
                postPhoto={postPhoto}
                postType={postType}
                caption={caption}
                pollOptions={pollOptions}
                location={location}
                visibilityDistance={visibilityDistance}
                userMetadata={userMetadata}
                setUserMetadata={setUserMetadata}
                onError={setErrorMessage}
                postAnonymous={postAnonymous}
                channel={channel}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
