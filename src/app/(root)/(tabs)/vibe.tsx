import { useSession } from "@/contexts/SessionContext";
import VibeScreen from "@/components/vibe/vibeScreen";
import { View, Text } from "react-native";
import VisibilityRadiusButton from "@/components/buttons/VisibilityRadiusButton";
import React, { useState } from "react";

const Vibe = () => {
  const { loading, userMetadata, searchRadius, setSearchRadius } = useSession();
  const [colorGradient, setColorGradient] = useState<string>('rgba(0,0,0,0.0)');

  if (loading) return null;

  return (
  <>
    <VibeScreen colorGradient={colorGradient} setColorGradient={setColorGradient} />
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
  </>
  );
};

export default Vibe;
