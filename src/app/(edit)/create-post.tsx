import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Keyboard, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/contexts/SessionContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import PhotoPost from "@/components/post/PhotoPost";
import TextPost from "@/components/post/TextPost";
import PollPost from "@/components/post/PollPost";
import ResponsePost from "@/components/post/ResponsePost";
import ErrorMessage from "@/components/ErrorMessage";
import VisibilitySelector from "@/components/post/VisibilitySelector";
import PostUploader from "@/components/post/PostUploader";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

type PostType = 'text' | 'poll' | 'response';

const CreatePost = () => {
  const { newPhotoUri } = useLocalSearchParams();
  const { userMetadata, setUserMetadata, location, isAnonymous } = useSession();
  const [postPhoto, setPostPhoto] = useState<string | null>(newPhotoUri ? newPhotoUri as string : null);
  const [postType, setPostType] = useState<PostType>('text');
  const [caption, setCaption] = useState("");
  const [pollOptions, setPollOptions] = useState(['', '']);
  const scrollViewRef = useRef<ScrollView>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [visibilityDistance, setVisibilityDistance] = useState<number>(5000);
  const [postAnonymous, setPostAnonymous] = useState<boolean>(isAnonymous);

  useEffect(() => {
    setErrorMessage("");
  }, [postType, caption]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

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
              onPress: () => router.push({pathname: "/camera", params: { path: "/(edit)/create-post" }})
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
          />
        );
      case 'poll':
        return (
          <PollPost 
            question={caption}
            options={pollOptions}
            onQuestionChange={setCaption}
            onOptionsChange={setPollOptions}
          />
        );
      case 'response':
        return (
          <ResponsePost 
            prompt={caption}
            onPromptChange={setCaption}
          />
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-800">
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
        >
          <View className="flex-1 mx-4 mt-4 pb-12">
            {errorMessage && <ErrorMessage message={errorMessage} />}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity 
                onPress={pickImage}
                className={`flex-row items-center space-x-2 px-4 py-3 rounded-xl border shadow-sm ${
                  postPhoto ? 'bg-gray-300 border-gray-300' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome6 name="image" size={18} color={postPhoto ? "#FFFFFF" : "#4B5563"} />
                <Text className={`font-JakartaMedium text-sm ml-1 ${postPhoto ? 'text-white' : 'text-gray-700'}`}>Add Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setPostType('text')}
                className={`flex-row items-center space-x-2 px-4 py-3 rounded-xl border shadow-sm ${
                  postType === 'text' ? 'bg-blue-300 border-blue-300' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome6 name="pen" size={18} color={postType === 'text' ? "#FFFFFF" : "#4B5563"} />
                <Text className={`font-JakartaMedium text-sm ml-1 ${postType === 'text' ? 'text-white' : 'text-gray-700'}`}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setPostType('poll')}
                className={`flex-row items-center space-x-2 px-4 py-3 rounded-xl border shadow-sm ${
                  postType === 'poll' ? 'bg-purple-300 border-purple-300' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome6 name="chart-simple" size={18} color={postType === 'poll' ? "#FFFFFF" : "#4B5563"} />
                <Text className={`font-JakartaMedium text-sm ml-1 ${postType === 'poll' ? 'text-white' : 'text-gray-700'}`}>Poll</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setPostType('response')}
                className={`flex-row items-center space-x-2 px-4 py-3 rounded-xl border shadow-sm ${
                  postType === 'response' ? 'bg-amber-300 border-amber-300' : 'bg-white border-gray-200'
                }`}
              >
                <FontAwesome6 name="comments" size={18} color={postType === 'response' ? "#FFFFFF" : "#4B5563"} />
                <Text className={`font-JakartaMedium text-sm ml-1 ${postType === 'response' ? 'text-white' : 'text-gray-700'}`}>Response</Text>
              </TouchableOpacity>
            </View>

            {postPhoto && <PhotoPost imageUri={postPhoto} onRemove={() => setPostPhoto(null)} />}
            {renderPostContent()}

            <VisibilitySelector 
              sliderValue={visibilityDistance}
              onSliderValueChange={setVisibilityDistance}
              postAnonymous={postAnonymous}
              setPostAnonymous={setPostAnonymous}
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
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
