import { TouchableOpacity, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';

const VibeButton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();
    rotateAnimation.start();

    return () => {
      shimmerAnimation.stop();
      rotateAnimation.stop();
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

  const gradientStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={shimmerStyle}>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(root)/(social)/vibe",
          });
        }}
        className="w-12 h-12 rounded-full justify-center items-center overflow-hidden"
      >
        <LinearGradient
          colors={['#FF69B4', '#DA70D6', '#9370DB', '#FF69B4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
        <Animated.View style={[gradientStyle, { position: 'absolute', width: '100%', height: '100%', zIndex: 2 }]}>
          <LinearGradient
            colors={['#FF69B4', '#DA70D6', '#9370DB', '#FF69B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.8,
            }}
          />
        </Animated.View>
        <MaterialIcons name="palette" size={28} color="white" style={{ zIndex: 3 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default VibeButton;
