// CropPhoto.tsx
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import React, { useState } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  Image as RNImage,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';

export default function CropPhoto() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const [minScale, setMinScale] = useState(1);
  const MAX_SCALE = 6;

  const { newPhotoUri, path, aspectRatio = '1:1', caption, postType, pollOptions } = useLocalSearchParams<{
    newPhotoUri: string;
    path: string;
    aspectRatio: string;
    caption?: string;
    postType?: string;
    pollOptions?: string;
  }>();

  const photo = newPhotoUri;
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [cropArea, setCropArea] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  });
  const [cropAreaLayout, setCropAreaLayout] = useState({
    minX: 0,
    minY: 0,
    maxX: SCREEN_WIDTH,
    maxY: SCREEN_HEIGHT,
  });

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(v, max));

  const minX = (sc: number) => cropAreaLayout.maxX - SCREEN_WIDTH/2 - (imgW * sc) / 2; 
  const maxX = (sc: number) => cropAreaLayout.minX - SCREEN_WIDTH/2 + (imgW * sc) / 2;
  const minY = (sc: number) => cropAreaLayout.maxY - SCREEN_HEIGHT/2 - (imgH * sc) / 2;
  const maxY = (sc: number) => cropAreaLayout.minY - SCREEN_HEIGHT/2 + (imgH * sc) / 2;

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = clamp(
        panStartX.value + e.translationX,
        minX(scale.value),
        maxX(scale.value)
      );
      translateY.value = clamp(
        panStartY.value + e.translationY,
        minY(scale.value),
        maxY(scale.value)
      );
    });

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onUpdate((e) => {

      const next = clamp(scale.value + e.velocity * 0.02, minScale, MAX_SCALE);

      translateX.value = clamp(
        translateX.value + e.focalX * (1 - next / scale.value),
        minX(next),
        maxX(next)
      );
      translateY.value = clamp(
        translateY.value + e.focalY * (1 - next / scale.value),
        minY(next),
        maxY(next)
      );

      scale.value = next;
    });

  panGesture.simultaneousWithExternalGesture(pinchGesture);
  pinchGesture.simultaneousWithExternalGesture(panGesture);

  const gestures = Gesture.Simultaneous(panGesture, pinchGesture);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const onImageLoad = (e: any) => {
    const { width, height } = e.nativeEvent.source;
    const [a, b] = aspectRatio.split(':').map(Number);
    const cropRatio = a / b;
    const imgRatio = width / height;
    setImgW(SCREEN_WIDTH);
    setImgH(SCREEN_WIDTH / imgRatio);
    const minScale = imgRatio < cropRatio ? 1 : imgRatio / cropRatio;

    scale.value = minScale;
    setMinScale(minScale);

    setCropArea({
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH / cropRatio,
    });
  };

  const handleCropAreaLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setCropAreaLayout({
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    });
  }

  async function handleUsePhoto() {
    if (!photo) return;

    try {
      const { width, height } = await RNImage.getSize(photo);

      const scaledW = imgW * scale.value;
      const scaledH = imgH * scale.value;

      const originX =
        (scaledW / 2 - translateX.value - cropArea.width / 2) / scaledW;
      const originY =
        (scaledH / 2 - translateY.value - cropArea.height / 2) / scaledH;

      const cropResult = await manipulateAsync(
        photo,
        [
          {
            crop: {
              originX: Math.floor(width * originX),
              originY: Math.floor(height * originY),
              width: Math.floor((width * cropArea.width) / scaledW),
              height: Math.floor((height * cropArea.height) / scaledH),
            },
          },
        ],
        { compress: 1, format: SaveFormat.JPEG }
      );

      router.push({
        pathname: path as any,
        params: { 
          newPhotoUri: cropResult.uri,
          caption: caption,
          postType: postType,
          pollOptions: pollOptions
        },
      });
    } catch (err) {
      console.error(err);
      alert('Failed to crop photo');
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-black">
        <View className="flex-1">
          <GestureDetector gesture={gestures}>
            <View className="flex-1">
              <Animated.Image
                className="w-full h-full"
                style={imageStyle}
                source={photo ? { uri: photo } : undefined}
                resizeMode="contain"
                onLoad={onImageLoad}
              />
            </View>
          </GestureDetector>
          <View
            onLayout={handleCropAreaLayout} pointerEvents="none" className="absolute border-2 border-white bg-white/10" style={{
            width: cropArea.width,
            height: cropArea.height,
            left: (SCREEN_WIDTH - cropArea.width) / 2,
            top: (SCREEN_HEIGHT - cropArea.height) / 2,
          }} />
        </View>
        <View className="absolute bottom-0 left-0 right-0 top-[75%]">
          <View className="flex-row justify-between mt-24 m-8">
            <TouchableOpacity 
              className="px-6 py-3 bg-white/30 rounded-full active:bg-white/40"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold text-base">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="px-6 py-3 bg-blue-500/80 rounded-full active:bg-blue-500/90"
              onPress={handleUsePhoto}
            >
              <Text className="text-white font-semibold text-base">Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
