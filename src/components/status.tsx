import React from 'react';
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useState } from "react";
import { getLocalImageURI } from "@/utils/getImage";
import { supabase } from "@/utils/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusProps } from "@/types/type";
import { useSession } from "@/contexts/SessionContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { formatTimeAgo } from '@/hooks/formatTimeAgo';

const Status = ({ user_id }: StatusProps) => {
    const [status, setStatus] = useState<any>();
    const [likes, setLikes] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const { userMetadata, isAnonymous } = useSession();
    const isOwnProfile = user_id === userMetadata?.id;
    
    const fetchLikes = async () => {
      if (!status?.[0]?.id) return;
      
      const { data: likesData, error: likesError } = await supabase
        .from('status_likes')
        .select('user_id')
        .eq('status_id', status[0].id);

      if (likesError) {
        console.error('Error fetching likes:', likesError);
        return;
      }

      setLikes(likesData?.length || 0);
      setLiked(likesData?.some((like) => like.user_id === userMetadata?.id) || false);
    };
    
    useEffect(() => {
        const fetchStatusFromLocalStorage = async () => {
          try {
            const storedStatus = await AsyncStorage.getItem(`status_${user_id}`);
            if (storedStatus) {
              const parsedStatus = JSON.parse(storedStatus);
              setStatus(parsedStatus);
            }
          } catch (error) {
            console.error('Error reading from local storage:', error);
          }
        };

        const fetchStatus = async () => {
          if (!user_id) return;
          
          const { data: statusData, error: statusError } = await supabase
            .from('statuses')
            .select('*')
            .eq('id', user_id)
    
          if (statusError) {
            console.error('Error fetching posts:', statusError);
            return;
          }
    
          const statusWithURI = await Promise.all(
            (statusData || []).map(async (status) => ({
              ...status,
              image_url: await getLocalImageURI(status.image_url),
            }))
          );
    
          setStatus(statusWithURI);
          // Store status in local storage
          try {
            await AsyncStorage.setItem(`status_${user_id}`, JSON.stringify(statusWithURI));
          } catch (error) {
            console.error('Error saving to local storage:', error);
          }
        };
    
        fetchStatusFromLocalStorage();
        fetchStatus();
      }, [user_id]);

    useEffect(() => {
      if (status?.[0]?.id) {
        fetchLikes();
      }
    }, [status]);

    const handleLike = async () => {
      if (!status?.[0]?.id || !userMetadata?.id) return;

      if (liked) {
        const { error } = await supabase
          .from('status_likes')
          .delete()
          .eq('status_id', status[0].id)
          .eq('user_id', userMetadata.id);

        if (error) {
          console.error('Error unliking status:', error);
          return;
        }

        // delete notification
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('post_id', status[0].id)
          .eq('sender_id', userMetadata?.id);

        if (deleteError) {
          console.error('Error deleting notification:', deleteError);
        }

        setLikes(prev => prev - 1);
        setLiked(false);
      } else {
        const { error } = await supabase
          .from('status_likes')
          .insert({ status_id: status[0].id, user_id: userMetadata.id, anonymous: isAnonymous });

        if (error) {
          console.error('Error liking status:', error);
          return;
        }

        // add notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            post_id: status[0].id,
            user_id: user_id,
            sender_id: userMetadata?.id,
            data: {
              anonymous: isAnonymous,
              type: 'status_like',
            }
          });
        
        if (notificationError) {
          console.error('Error adding notification:', notificationError);
        }
        setLikes(prev => prev + 1);
        setLiked(true);
      }
    };

    return (
        <View className="bg-white border-2 border-black rounded-2xl p-4 mt-2">
        {status && status.length > 0 ? (
            status.map((status: any) => (
              <React.Fragment key={status.id}>
              <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-lg">
                      {formatTimeAgo(new Date(status.created_at))}
                    </Text>
                    {status.location && (
                      <Text className="text-gray-500 text-lg ml-2">
                        •  {status.location}
                      </Text>
                    )}
                  </View>
              </View>
              <View className="flex-row items-center mb-4 mx-16 border-2 border-black rounded-2xl">
                <Image
                  source={{ uri: status.image_url }}
                  className="w-full aspect-[5/7] rounded-xl"
                  resizeMode="cover"
                />
              </View>
              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-black text-xl font-JakartaMedium">
                  {status.caption}
                </Text>
              </View>
              <View className="flex-row items-center mt-4 justify-end">
                {isOwnProfile ? (
                  <View className="flex-row items-center">
                    <FontAwesome6 name="heart" size={20} color="#ef4444" solid />
                    <Text className="ml-2 text-gray-600 font-JakartaMedium">
                      {likes} {likes === 1 ? 'like' : 'likes'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={handleLike}
                    className="flex-row items-center"
                  >
                    <FontAwesome6 
                      name="heart" 
                      size={20} 
                      color={liked ? "#ef4444" : "#6b7280"}
                      solid={liked}
                    />
                  </TouchableOpacity>
                )}
              </View>
              </React.Fragment>
            ))
        ) : (
            <Text className="text-black text-xl font-JakartaMedium">
            No current status.
            </Text>
        )}
        </View>
    );
};

export default Status;
