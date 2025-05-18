import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { TextPostProps } from '@/types/type';

const TextPost = ({ 
  text, 
  onChangeText, 
  placeholder = "What's on your mind?", 
  maxLength = 500 
}: TextPostProps) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <TextInput
        className="text-black text-lg font-JakartaMedium mb-2 min-h-[100px]"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        value={text}
        onChangeText={onChangeText}
        maxLength={maxLength}
        style={{ textAlignVertical: 'top' }}
      />
      <View className="flex-row justify-end">
        <Text className="text-gray-400 font-JakartaRegular">
          {text.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
};

export default TextPost;
