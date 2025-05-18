import React from 'react';
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useState } from "react";
import { getLocalImageURI } from "@/utils/getImage";
import { supabase } from "@/utils/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusProps } from "@/types/type";

const Status = ({ user_id }: StatusProps) => {
    const [status, setStatus] = useState<any>();
    
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

    return (
        <View className="bg-white border-2 border-black rounded-2xl p-4 mt-2">
        {status && status.length > 0 ? (
            status.map((status: any) => (
              <React.Fragment key={status.id}>
              <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-lg">
                      {new Date(status.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
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
