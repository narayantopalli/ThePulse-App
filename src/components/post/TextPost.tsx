import React, { forwardRef } from 'react';
import { View, TextInput, Text } from 'react-native';
import { TextPostProps } from '@/types/type';

const TextPost = forwardRef<TextInput, TextPostProps>(({ 
  text, 
  onChangeText, 
  placeholder = "What's on your mind?", 
  maxLength = 500 
}, ref) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <TextInput
        ref={ref}
        className="mb-2 min-h-[100px]"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        value={text}
        onChangeText={onChangeText}
        autoCorrect={true}
        autoCapitalize="sentences"
        maxLength={maxLength}
        style={{
          fontFamily: "font-JakartaRegular",
          fontSize: 18,
          color: "#333",
          paddingVertical: 8,
          textAlignVertical: 'top'
        }}
      />
      <View className="flex-row justify-end">
        <Text className="text-gray-400 font-JakartaRegular">
          {text.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
});

export default TextPost;
