import { View, TouchableWithoutFeedback, Keyboard, Text } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import VisibilityRadiusButton from "@/components/VisibilityRadiusButton";
import WordInput from "@/components/community/wordInput";
import Color from "@/components/community/color";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Vibe = () => {
  const { loading, searchRadius, setSearchRadius, userMetadata, locationString } = useSession();
  const [color, setColor] = useState<string>('rgba(0,0,0,0.0)');
  const [colorGradient, setColorGradient] = useState<string>('rgba(0,0,0,0.0)');

  if (loading) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-300">
        <View className="flex-1">
          <Color color={color} setColor={setColor} colorGradient={colorGradient} setColorGradient={setColorGradient} />
          <View className="absolute top-4 right-4 left-4 flex-row justify-between items-center">
            <View className="rounded-full overflow-hidden shadow-lg" style={{ backgroundColor: colorGradient }}>
              <View className="px-4 py-2">
                <Text className="text-white text-lg font-semibold">
                  Words Left: {userMetadata?.words_left || 0}
                </Text>
                <Text className="text-white/70 text-xs text-center">
                  Refreshes daily
                </Text>
              </View>
            </View>
            <View className="rounded-full overflow-hidden shadow-lg" style={{ backgroundColor: colorGradient }}>
              <VisibilityRadiusButton
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
              />
            </View>
          </View>
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
  );
};

export default Vibe;
