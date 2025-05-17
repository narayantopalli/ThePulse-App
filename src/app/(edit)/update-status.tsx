import React, { useState, useEffect, useRef } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { decode } from "base64-arraybuffer";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const UpdateStatus = () => {
  const { newPhotoUri } = useLocalSearchParams();
  const { userMetadata, setUserMetadata } = useSession();
  const [caption, setCaption] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [location, setLocation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
        supabase.from("statuses").update({
          image_url: `statuses/${uri}`,
          caption: caption,
          location: location,
          created_at: last_posted
        }).eq("id", userMetadata?.id).select()
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
    if (isLoadingLocation) return;
    
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const { latitude, longitude } = location.coords;

      const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
      const radius = 100;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=point_of_interest&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.results?.length > 0) {
        const closestPlace = data.results[0];
        setLocation(closestPlace.name);
      } else {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (address) {
          const locationString = [
            address.street,
            address.city,
            address.region,
            address.country
          ].filter(Boolean).join(', ');
          setLocation(locationString);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <View className="flex-1 bg-general-600">
      <View className="flex-1 mx-4 mt-4">
        <View className="flex-row items-center justify-between bg-white border-2 border-black rounded-2xl p-2 mb-4">
            <TouchableOpacity
                onPress={askLocation}
                disabled={isLoadingLocation}
                className={`flex-row items-center justify-center w-12 h-12 rounded-full ${isLoadingLocation ? 'bg-gray-400' : 'bg-[#007AFF]'} shadow-sm`}
            >
                <FontAwesome6 name="location-dot" size={20} color="white" />
            </TouchableOpacity>
            <TextInput
                className="flex-1 text-black text-2xl font-JakartaMedium ml-3"
                placeholder="Add your location..."
                placeholderTextColor="#666"
                value={location}
                onChangeText={setLocation}
            />
        </View>
          <View className="bg-white border-2 border-black rounded-2xl h-48 p-4">
              <TextInput
                  ref={inputRef}
                  className="text-black text-xl font-JakartaMedium"
                  placeholder={`Give an update on your day...`}
                  multiline
                  value={caption}
                  onChangeText={setCaption}
              />
          </View>
        <NiceButton
            title={isPosting ? "Posting..." : "Confirm Update"}
            onPress={OnConfirm}
            className="mt-6"
            bgVariant={isPosting ? "secondary" : "success"}
        />
      </View>
    </View>
  );
};

export default UpdateStatus;
