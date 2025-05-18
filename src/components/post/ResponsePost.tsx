import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { ResponsePostProps } from '@/types/type';

const ResponsePost = ({ 
  prompt, 
  onPromptChange, 
  placeholder = "Ask a question..." 
}: ResponsePostProps) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-general-700 font-JakartaMedium mb-3 text-base">Prompt for Responses</Text>
      <TextInput
        className="text-black text-lg font-JakartaMedium mb-2 bg-gray-50 rounded-xl p-3 min-h-[100px] border border-gray-200"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        value={prompt}
        onChangeText={onPromptChange}
        style={styles.textInput}
      />
      <Text className="text-gray-400 text-sm font-JakartaRegular">
        {prompt.length} characters
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: 'top',
  },
});

export default ResponsePost;
