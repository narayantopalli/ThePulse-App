import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { VisibilitySelectorProps } from '@/types/type';

const VisibilitySelector = ({ 
  sliderValue, 
  onSliderValueChange,
  postAnonymous,
  setPostAnonymous
}: VisibilitySelectorProps) => {
  const getVisibilityText = (value: number) => {
    if (value >= 5000) return "Everyone";
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`;
    }
    return `${value}m`;
  };

  return (
    <View className="mt-2 mb-4 bg-white border-2 border-black rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-black text-lg font-JakartaMedium">Post Visibility</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-600 text-sm font-JakartaMedium">Max 5km</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-600">Limit visibility to:</Text>
        <Text className="text-gray-700 font-JakartaMedium">
          {getVisibilityText(sliderValue)}
        </Text>
      </View>
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={() => {
            onSliderValueChange(5000);
          }}
          className={`px-3 py-2 rounded-lg ${sliderValue === 0 || sliderValue >= 5000 ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <Text className={`font-JakartaMedium ${sliderValue === 5000 ? 'text-white' : 'text-gray-700'}`}>Everyone</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Slider
            style={{ height: 40 }}
            minimumValue={100}
            maximumValue={5000}
            step={100}
            value={sliderValue}
            onValueChange={(value) => {
              onSliderValueChange(value);
            }}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#3B82F6"
          />
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <Text className="text-gray-600">Post Anonymously</Text>
        <Switch
          value={postAnonymous}
          onValueChange={setPostAnonymous}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={postAnonymous ? '#ffffff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

export default VisibilitySelector;
