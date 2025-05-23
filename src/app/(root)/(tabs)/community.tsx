import { View, TouchableWithoutFeedback, Keyboard, Text } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import VisibilityRadiusButton from "@/components/VisibilityRadiusButton";
import WordInput from "@/components/community/wordInput";
import Color from "@/components/community/color";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

const Home = () => {
  // const { isPro } = useRevenueCat();
  const { loading, searchRadius, setSearchRadius, userMetadata } = useSession();
  const [color, setColor] = useState<string>('rgba(0,0,0,0.0)');
  const [colorGradient, setColorGradient] = useState<string>('rgba(0,0,0,0.0)');

  if (loading) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-300">
        <Color color={color} setColor={setColor} colorGradient={colorGradient} setColorGradient={setColorGradient} />
        <View className="absolute top-32 left-0 right-0 items-center">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={[colorGradient, color]}
              className="px-8 py-3"
            >
              <Text className="text-white text-5xl font-JakartaExtraBold tracking-wider p-3">
                The Vibe
              </Text>
            </LinearGradient>
          </View>
        </View>
        <VisibilityRadiusButton
          searchRadius={searchRadius}
          setSearchRadius={setSearchRadius}
        />
        <View className="absolute top-4 right-4 rounded-full" style={{ backgroundColor: colorGradient }}>
          <View className="px-4 py-2 rounded-full">
            <Text className="text-white text-lg font-semibold">
              Words Left: {userMetadata?.words_left || 0}
            </Text>
            <Text className="text-white/70 text-xs text-center">
              Refreshes daily
            </Text>
          </View>
        </View>
        <View className="absolute inset-0 justify-center items-center -mt-32">
          <WordInput/>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
