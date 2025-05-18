import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { PhotoPostProps } from '@/types/type';

const PhotoPost = ({ imageUri, onRemove }: PhotoPostProps) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <View className="aspect-[3/4] w-[40%] self-center relative">
        <Image 
          source={{ uri: imageUri }}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
        />
        {onRemove && (
          <TouchableOpacity 
            onPress={onRemove}
            className="absolute w-7 h-7 -top-2 -right-2 bg-red-500 rounded-full items-center justify-center shadow-md"
            style={{aspectRatio: 1}}
          >
            <FontAwesome6 name="xmark" size={14} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PhotoPost; 