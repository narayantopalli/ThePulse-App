import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { getLocationString } from '@/hooks/getLocationString';
import { FontAwesome6 } from '@expo/vector-icons';
import { PostUploaderProps } from '@/types/type';

const PostUploader = ({
  postPhoto,
  postType,
  caption,
  pollOptions = [],
  location,
  visibilityDistance,
  userMetadata,
  setUserMetadata,
  onError,
  postAnonymous
}: PostUploaderProps) => {
    const [isPosting, setIsPosting] = useState(false);
    
    const uploadPost = async () => {
        try {
            if (caption === "") {
                onError("Please enter a caption");
                return;
            }
            if (postType === 'poll' && pollOptions.some(option => option === "")) {
                onError("Please enter all poll options");
                return;
            }
            setIsPosting(true);
            let uploadResult = null;
            const last_posted = new Date().toISOString();

            if (postPhoto) {
                // Start all async operations in parallel
                const [mediaSave, base64] = await Promise.all([
                MediaLibrary.saveToLibraryAsync(postPhoto),
                FileSystem.readAsStringAsync(postPhoto, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                ]);

                const uri = postPhoto.split("/").pop();
                if (!uri) return;

                const buffer = decode(base64);
                
                // Upload image to storage
                uploadResult = await supabase.storage
                .from("images")
                .upload(`posts/${uri}`, buffer, { 
                    contentType: `image/${uri.split(".").pop()}`, 
                    upsert: true 
                });
            }

            const locationString = location ? await getLocationString(location) : "";

            // Create post in database
            const postResult = await supabase.from("posts").insert({
                user_id: userMetadata?.id,
                location_string: locationString,
                data: {
                    image_url: postPhoto ? `posts/${postPhoto.split("/").pop()}` : null,
                    type: postType,
                    post_data: postType === 'poll' ? {
                        caption: caption,
                        options: pollOptions
                    } : {
                        caption: caption
                    }
                },
                anonymous: postAnonymous,
                latitude: location?.[0],
                longitude: location?.[1],
                visibility_radius: visibilityDistance
            }).select();

            if (uploadResult?.error) throw uploadResult.error;
            if (postResult.error) throw postResult.error;

            // Update user metadata and profile
            setUserMetadata({...userMetadata, last_posted: last_posted});
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ last_posted: last_posted })
                .eq("id", userMetadata?.id);

            if (profileError) throw profileError;
            setIsPosting(false);
            router.replace("/(root)/(tabs)/home");
        } catch (error) {
            console.error('Error in uploadStatus:', error);
            onError("Failed to upload post. Please try again.");
            setIsPosting(false);
            throw error;
        }
    };

    return (
        <TouchableOpacity
            onPress={uploadPost}
            disabled={isPosting}
            className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${
                isPosting ? 'bg-gray-200' : 'bg-green-500'
            }`}
        >
            <FontAwesome6 
                name="paper-plane" 
                size={16} 
                color={isPosting ? "#9CA3AF" : "white"} 
                className="mr-2"
            />
            <Text 
                className={`font-JakartaMedium text-base ${
                    isPosting ? 'text-gray-400' : 'text-white'
                }`}
            >
                {isPosting ? "Posting..." : "Share Post"}
            </Text>
        </TouchableOpacity>
    );
};

export default PostUploader;
