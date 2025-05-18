import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { PollPostProps } from '@/types/type';

const PollPost = ({ question, options, onQuestionChange, onOptionsChange }: PollPostProps) => {
  const addOption = () => {
    if (options.length < 4) {
      onOptionsChange([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    onOptionsChange(newOptions);
  };

  return (
    <View className="bg-white rounded-2xl p-4 pt-2 mb-4 shadow-sm border border-gray-100">
      <TextInput
        className="text-black text-xl font-JakartaMedium mb-4 h-12 border-b border-gray-100"
        placeholder="Ask a question..."
        placeholderTextColor="#9CA3AF"
        value={question}
        onChangeText={onQuestionChange}
      />
      {options.map((option, index) => (
        <View key={index} className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 text-black font-JakartaMedium bg-gray-50 px-4 py-3 rounded-xl"
            placeholder={`Option ${index + 1}`}
            placeholderTextColor="#9CA3AF"
            value={option}
            onChangeText={(text) => updateOption(index, text)}
          />
          {options.length > 2 && (
            <TouchableOpacity 
              onPress={() => removeOption(index)}
              className="ml-3 w-7 h-7 bg-red-500 rounded-full items-center justify-center"
              style={{aspectRatio: 1}}
            >
              <FontAwesome6 name="xmark" size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {options.length < 4 && (
        <TouchableOpacity 
          onPress={addOption}
          className="flex-row items-center mt-2 bg-gray-50 py-3 px-4 rounded-xl self-start"
        >
          <FontAwesome6 name="plus" size={16} color="#4B5563" />
          <Text className="text-general-800 font-JakartaMedium ml-2">Add Option</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PollPost;
