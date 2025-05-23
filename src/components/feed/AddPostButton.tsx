import { TouchableOpacity, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from "react";

const AddPostButton = () => {
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
            pathname: "/(root)/(edit)/create-post",
          });
        }}
        className="bg-general-900 w-16 h-16 rounded-full justify-center items-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <MaterialIcons name="add" size={32} color="black" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AddPostButton;
