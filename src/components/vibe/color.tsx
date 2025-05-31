import { useSession } from "@/contexts/SessionContext";
import getColorsFromWords from "@/utils/getColor";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";

import { View } from "react-native"

const Color = ({ color, setColor, colorGradient, setColorGradient }: { color: string, setColor: (color: string) => void, colorGradient: string, setColorGradient: (colorGradient: string) => void }) => {
    const { location, searchRadius } = useSession();

    useEffect(() => {
        if (location) {
            console.log("Getting the vibe...");
            getColorsFromWords(location, searchRadius, setColor, setColorGradient);
        }
    }, [location, searchRadius]);

    return (
        <View className="absolute inset-0 overflow-hidden opacity-50">
          <LinearGradient
            colors={[colorGradient, color, colorGradient]}
            style={{ width: '100%', height: '100%' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
    )
}

export default Color;
