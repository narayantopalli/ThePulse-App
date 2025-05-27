import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { ResponsePostProps } from '@/types/type';

const ResponsePost = forwardRef<TextInput, ResponsePostProps>(({ 
  prompt, 
  onPromptChange, 
  placeholder = "Ask a question..." 
}, ref) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-general-700 font-JakartaMedium mb-3 text-base">Prompt for Responses</Text>
      <TextInput
        ref={ref}
        className="mb-2 bg-gray-50 rounded-xl p-3 min-h-[100px] border border-gray-200"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        autoCorrect={true}
        autoCapitalize="sentences"
        value={prompt}
        onChangeText={onPromptChange}
        style={styles.textInput}
      />
      <Text className="text-gray-400 text-sm font-JakartaRegular">
        {prompt.length} characters
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: 'top',
    fontFamily: "font-JakartaRegular",
    fontSize: 18,
    color: "#333",
    paddingVertical: 8,
  },
});

export default ResponsePost;
