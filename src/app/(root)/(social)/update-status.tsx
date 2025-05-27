import React, { useState, useEffect, useRef } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, TouchableOpacity, Image, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { decode } from "base64-arraybuffer";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import BackButton from "@/components/buttons/backButton";
import ErrorMessage from "@/components/ErrorMessage";

const UpdateStatus = () => {
  const { newPhotoUri } = useLocalSearchParams();
  const { userMetadata, setUserMetadata, locationString } = useSession();
  const [caption, setCaption] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const MAX_CAPTION_LENGTH = 280;
  const scrollViewRef = useRef<ScrollView>(null);
  const [localLocationString, setLocalLocationString] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const uploadStatus = async () => {
    if (typeof newPhotoUri !== 'string') return;

    try {
      // Start all async operations in parallel
      const [mediaSave, base64] = await Promise.all([
        MediaLibrary.saveToLibraryAsync(newPhotoUri),
        FileSystem.readAsStringAsync(newPhotoUri, {
          encoding: FileSystem.EncodingType.Base64,
        })
      ]);

      const uri = newPhotoUri.split("/").pop();
      if (!uri) return;

      const buffer = decode(base64);
      const last_posted = new Date().toISOString();

      // Upload image and create post in parallel
      const [uploadResult, postResult] = await Promise.all([
        supabase.storage
          .from("images")
          .upload(`statuses/${uri}`, buffer, { 
            contentType: `image/${uri.split(".").pop()}`, 
            upsert: true 
          }),
        supabase.from("statuses").upsert({
          id: userMetadata?.id,
          image_url: `statuses/${uri}`,
          caption: caption,
          location: localLocationString,
          created_at: last_posted
        })
      ]);

      if (uploadResult.error) throw uploadResult.error;
      if (postResult.error) throw postResult.error;

      // Update user metadata and profile
      setUserMetadata({...userMetadata, last_posted: last_posted});
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ last_posted: last_posted })
        .eq("id", userMetadata?.id);

      if (profileError) throw profileError;
    } catch (error) {
      console.error('Error in uploadStatus:', error);
      setErrorMessage("Failed to upload status. Please try again.");
      throw error;
    }
  };

  const OnConfirm = async () => {
    if (caption.length > 0 && !isPosting) {
      setIsPosting(true);
      try {
        await uploadStatus();
        router.replace("/(root)/(tabs)/home");
      } catch (error) {
        console.error('Error posting:', error);
        setIsPosting(false);
      }
    }
  };

  const askLocation = async () => {
    setLocalLocationString(locationString);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex flex-row justify-between items-center bg-white px-4 h-14 shadow-sm">
        <BackButton onPress={() => router.replace("/(root)/(tabs)/profile")} />
        <Text className="text-xl font-JakartaBold flex-1 text-center">Update Status</Text>
        <View className="border-2 border-black rounded-full overflow-hidden">
          <SmallProfilePhoto />
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
            
            {/* Image Preview */}
            {typeof newPhotoUri === 'string' && (
              <View className="bg-white rounded-3xl shadow-sm p-2 mb-6 overflow-hidden border-2 border-yellow-500">
                <View className="aspect-[3/4] w-[40%] self-center relative">
                  <Image 
                    source={{ uri: newPhotoUri }} 
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                  />
                </View>
              </View>
            )}

            {/* Location Input */}
            <View className="bg-white rounded-3xl shadow-sm p-3 mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={askLocation}
                  className={`flex-row items-center justify-center w-10 h-10 rounded-full bg-[#007AFF] shadow-sm`}
                >
                  <FontAwesome6 name="location-dot" size={18} color="white" />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 ml-3"
                  placeholder="Add your location..."
                  placeholderTextColor="#666"
                  value={localLocationString}
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize="sentences"
                  onChangeText={setLocalLocationString}
                  style={{
                    fontFamily: "font-JakartaRegular",
                    fontSize: 18,
                    color: "#333",
                    textAlignVertical: 'center'
                  }}
                />
              </View>
            </View>

            {/* Caption Input */}
            <View className="bg-white rounded-3xl shadow-sm p-4 mb-6">
              <TextInput
                ref={inputRef}
                className="min-h-[80px]"
                placeholder="What's on your mind?"
                multiline
                value={caption}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize="sentences"
                onChangeText={setCaption}
                maxLength={MAX_CAPTION_LENGTH}
                style={{
                  fontFamily: "font-JakartaRegular",
                  fontSize: 18,
                  color: "#333",
                  textAlignVertical: 'center'
                }}
              />
              <Text className="text-right text-gray-500 font-JakartaMedium mt-2">
                {caption.length}/{MAX_CAPTION_LENGTH}
              </Text>
            </View>

            {/* Post Button */}
            <View className="mt-auto mb-4">
              <TouchableOpacity
                onPress={OnConfirm}
                disabled={!caption.trim() || isPosting}
                className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${
                  isPosting || !caption.trim() ? 'bg-gray-200' : 'bg-green-500'
                }`}
              >
                <FontAwesome6 
                  name="paper-plane" 
                  size={16} 
                  color={isPosting || !caption.trim() ? "#9CA3AF" : "white"} 
                  className="mr-2"
                />
                <Text 
                  className={`font-JakartaMedium text-base ${
                    isPosting || !caption.trim() ? 'text-gray-400' : 'text-white'
                  }`}
                >
                  {isPosting ? "Posting..." : "Share Update"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default UpdateStatus;
