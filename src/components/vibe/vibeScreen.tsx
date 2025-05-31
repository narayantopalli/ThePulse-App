import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";

import WordInput from "@/components/vibe/wordInput";
import Color from "@/components/vibe/color";
import { useState } from "react";

const VibeScreen = ({ colorGradient, setColorGradient }: { colorGradient: string, setColorGradient: (color: string) => void }) => {
  const [color, setColor] = useState<string>('rgba(0,0,0,0.0)');

  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View className="flex-1 bg-gray-300">
        <View className="flex-1">
        <Color color={color} setColor={setColor} colorGradient={colorGradient} setColorGradient={setColorGradient} />
        <View className="absolute top-24 left-0 right-0 items-center px-4">
            <View className="rounded-2xl overflow-hidden shadow-xl w-full max-w-md">
            <LinearGradient
                colors={[colorGradient, color]}
                className="px-8 py-4"
            >
                <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="wave" size={40} color="white" />
                <Text className="text-white text-5xl font-JakartaExtraBold tracking-wider p-3">
                    The Vibe
                </Text>
                <MaterialCommunityIcons name="wave" size={40} color="white" />
                </View>
            </LinearGradient>
            </View>
        </View>
        <View className="absolute inset-0 justify-center items-center -mt-24">
            <WordInput/>
        </View>
        </View>
    </View>
  </TouchableWithoutFeedback>
)}

export default VibeScreen;