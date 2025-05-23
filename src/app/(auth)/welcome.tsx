import { Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Swiper from "react-native-swiper"
import { useEffect, useRef, useState } from 'react';
import { onboarding } from "@/constants";

const Onboarding = () => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLastSlide, setIsLastSlide] = useState(false);
    const [lastSlideReached, setLastSlideReached] = useState(false);

    useEffect(() => {
        if (activeIndex === onboarding.length - 1) {
            setLastSlideReached(true);
            setIsLastSlide(true);
        }
        else {
            setIsLastSlide(false); 
        }
    }, [activeIndex])

  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <View className="flex-1">
        <View className="w-full flex-row justify-end px-5">
          <TouchableOpacity
            onPress={() => {
              router.replace("/(auth)/sign-in");
            }}
            className="w-full flex justify-end items-end p-3"
          >
            <Text className="text-white text-md font-JakartaBold">{lastSlideReached ? "Done": "Skip"}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 mb-4">
          <Swiper
            ref={swiperRef}
            loop={false}
            dot={
              <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
            }
            activeDot={
              <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
            }
            onIndexChanged={(index) => {
              setActiveIndex(index);
            }}
          >
            {onboarding.map((item) => (
              <View key={item.id} className="flex-1 items-center justify-center px-4 mb-12">
                <Image
                  source={item.image}
                  className={item.className}
                  resizeMode="contain"
                />
                <View className="flex flex-row items-center justify-center w-full mt-4">
                  <Text className="text-white text-3xl font-bold text-center">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mt-2">
                  {item.description}
                </Text>
              </View>
            ))}
          </Swiper>
        </View>
        <View className="w-full items-center pb-6">
          <TouchableOpacity
            onPress={() =>
              isLastSlide
                ? router.replace("/(auth)/sign-in")
                : swiperRef.current?.scrollBy(1)
            }
            className="bg-[#0286FF] w-96 py-4 rounded-full"
          >
            <Text className="text-white text-lg font-JakartaBold text-center">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
