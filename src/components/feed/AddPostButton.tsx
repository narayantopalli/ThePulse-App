import { TouchableOpacity, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from "react";

const AddPostButton = ({ sizeMultiplier = 1 }: { sizeMultiplier?: number }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  const shimmerStyle = {
    transform: [
      {
        scale: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
    ],
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 1],
    }),
  };

  return (
    <Animated.View style={shimmerStyle}>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(root)/(social)/create-post",
          });
        }}
        className="bg-[#FFFC00] rounded-full justify-center items-center"
        style={{
          width: 42 * sizeMultiplier,
          height: 42 * sizeMultiplier,
        }}
      >
        <MaterialIcons name="add" size={32 * sizeMultiplier} color="#000000" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AddPostButton;
