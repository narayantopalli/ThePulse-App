import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from "react-native";
import ProfilePhoto from "@/components/profilePhoto";
import { calculateAge } from "@/constants";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileHeaderProps } from "@/types/type";
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileHeader = ({ 
  onPhotoPress, 
  userMetadata,
  isOwnProfile = false,
  profilePhotoURL,
}: ProfileHeaderProps) => {
  const { myGroups } = useSession();
  const [numGroups, setNumGroups] = useState(0);
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState(0);

  useEffect(() => {
    const fetchScoreAndRanking = async () => {
      try {
        const {data: userScore, error} = await supabase
          .from('scores')
          .select('score, rank, num_groups')
          .eq('user_id', userMetadata?.id);
        if (userScore && userScore[0]) {
          setScore(userScore[0].score || 0);
          setRanking(userScore[0].rank || 0);
        } else {
          setScore(0);
          setRanking(0);
        }
        if (isOwnProfile) {
          setNumGroups(myGroups.length);
        } else {
          if (userScore && userScore[0]) {
            setNumGroups(userScore[0].num_groups || 0);
          } else {
            setNumGroups(0);
          }
        }
        AsyncStorage.setItem(`${userMetadata?.id}-numGroups`, numGroups.toString());
        AsyncStorage.setItem(`${userMetadata?.id}-score`, score.toString());
        AsyncStorage.setItem(`${userMetadata?.id}-ranking`, ranking.toString());
      } catch (error) {
        console.error('Error fetching score and ranking:', error);
      }
    }
    AsyncStorage.getItem(`${userMetadata?.id}-numGroups`).then((value) => {
      setNumGroups(parseInt(value || '0'));
    });
    AsyncStorage.getItem(`${userMetadata?.id}-score`).then((value) => {
      setScore(parseInt(value || '0'));
    }); 
    AsyncStorage.getItem(`${userMetadata?.id}-ranking`).then((value) => {  
      setRanking(parseInt(value || '0'));
    });
    fetchScoreAndRanking();
  }, [userMetadata]);

  const photoURL = profilePhotoURL;
  
  const age = userMetadata?.birthday 
    ? calculateAge(userMetadata.birthday)
    : null;

  const formatLastActive = (lastPosted?: string) => {
    if (!lastPosted) return "N/A";
    
    const lastActive = new Date(lastPosted);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <View className="px-4">
      {/* Top Section with Photo and Stats */}
      <View className="flex-row items-center mt-4">
        {/* Profile Photo */}
        <TouchableOpacity 
          onPress={onPhotoPress}
          disabled={!onPhotoPress}
          className="relative"
        >
          <ProfilePhoto radius={80} profilePhotoURL={photoURL || ''} />
          {isOwnProfile && (
            <View className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm rounded-full p-1.5 border border-gray-100">
              <MaterialCommunityIcons name="camera" size={20} color="black" />
            </View>
          )}
        </TouchableOpacity>

        {/* Stats Section */}
        <View className="flex-1 flex-row justify-around ml-8">
          <View className="items-center bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100">
            <Text className="text-black text-xl font-JakartaBold">#{ranking}</Text>
            <Text className="text-gray-600 text-sm text-center">Pulse{'\n'}Ranking</Text>
          </View>
          <View className="items-center bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100">
            <Text className="text-black text-xl font-JakartaBold">{score}</Text>
            <Text className="text-gray-600 text-sm text-center">Pulse{'\n'}Rating</Text>
          </View>
          <View className="items-center bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100">
            <Text className="text-black text-xl font-JakartaBold">{numGroups}</Text>
            <Text className="text-gray-600 text-sm text-center">Groups{'\n'}Joined</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View className="mt-4 ml-4">
        <Text className="text-black text-lg font-JakartaBold">
          {`${userMetadata?.firstname || ''} ${userMetadata?.lastname || ''}`}
        </Text>
        {age !== null && (
          <Text className="text-gray-600 text-base mt-1">
            {`${age} years old`}
          </Text>
        )}
        {userMetadata?.pronouns && (
          <Text className="text-gray-600 text-base mt-1">
            {userMetadata.pronouns}
          </Text>
        )}
        <Text className="text-gray-500 text-sm mt-2">
          {`Last active ${formatLastActive(userMetadata?.last_posted).toLowerCase()}`}
        </Text>
      </View>

      {/* Action Buttons */}
      {isOwnProfile && (
        <View className="flex-row mt-4">
          <TouchableOpacity 
            onPress={() => router.push('/(root)/my-posts')}
            className="flex-1 bg-white/90 backdrop-blur-sm py-2.5 rounded-xl shadow-sm border border-gray-100"
          >
            <Text className="text-black text-center font-JakartaMedium">
              View My Posts
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileHeader;
