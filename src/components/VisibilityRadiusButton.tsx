import { View, Text, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";

interface VisibilityRadiusButtonProps {
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
}

const VisibilityRadiusButton = ({ searchRadius, setSearchRadius }: VisibilityRadiusButtonProps) => {
  const [editSearchRadius, setEditSearchRadius] = useState(false);
  const [tempRadius, setTempRadius] = useState(searchRadius);

  const handleSaveRadius = () => {
    setSearchRadius(tempRadius);
    AsyncStorage.setItem('searchRadius', tempRadius.toString());
    setEditSearchRadius(false);
  };

  const getVisibilityText = (value: number) => {
    if (value >= 16093) return "Maximum"; // 16093 meters = 10 miles
    if (value >= 804) { // 804 meters = 0.5 miles
      return `${(value / 1609.34).toFixed(1)}mi`;
    }
    return `${100*Math.round(value * 0.0328084)}ft`; // Convert meters to feet
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => {
          setTempRadius(searchRadius);
          setEditSearchRadius(true);
        }}
        className="absolute top-4 left-4 bg-purple-500 rounded-full px-4 py-2 flex-row items-center space-x-2"
      >
        <MaterialIcons 
          name="my-location" 
          size={20} 
          color="#f4f3f4"
        />
        <Text className="ml-2 text-white font-JakartaMedium">
          {getVisibilityText(searchRadius)}
        </Text>
      </TouchableOpacity>
      {editSearchRadius && (
        <Modal
          visible={editSearchRadius}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditSearchRadius(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px] max-h-[20%] flex-1">
              <Text className="text-xl font-JakartaSemiBold mb-4">Search Radius</Text>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600">Limit search to:</Text>
                <Text className="text-gray-700 font-JakartaMedium">
                  {getVisibilityText(tempRadius)}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() => {
                    setTempRadius(16093); // 10 miles in meters
                  }}
                  className={`px-3 py-2 rounded-lg ${tempRadius === 0 || tempRadius >= 16093 ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                  <Text className={`font-JakartaMedium ${tempRadius === 16093 ? 'text-white' : 'text-gray-700'}`}>Maximum</Text>
                </TouchableOpacity>
                <View className="flex-1">
                  <Slider
                    style={{ height: 40 }}
                    minimumValue={100}
                    maximumValue={16093}
                    step={100}
                    value={tempRadius}
                    onValueChange={(value) => {
                      setTempRadius(value);
                    }}
                    minimumTrackTintColor="#3B82F6"
                    maximumTrackTintColor="#D1D5DB"
                    thumbTintColor="#3B82F6"
                  />
                </View>
              </View>

              <View className="flex-row justify-end gap-2 mt-4">
                <TouchableOpacity 
                  onPress={() => setEditSearchRadius(false)}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700 font-JakartaMedium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveRadius}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-JakartaMedium">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default VisibilityRadiusButton; 