import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { useState, useRef } from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const Camera = () => {
  const { path, returnPath, lockFront } = useLocalSearchParams<{ path: string, returnPath: string, savePhoto: string, lockFront: string }>();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [zoom, setZoom] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission || !mediaPermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white text-2xl font-bold text-center mb-6">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity 
            onPress={() => {
              requestPermission();
              requestMediaPermission();
            }}
            className="bg-white px-6 py-3 rounded-full"
          >
            <Text className="text-black font-bold text-lg">
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      let photo = await cameraRef.current.takePictureAsync();
      if (!photo?.uri) return;

      // First crop to square
      const { width, height } = photo;
      const newHeight = 0.6 * height;
      const y = 0.25 * newHeight;
      
      photo = await manipulateAsync(
        photo.uri,
        [{ crop: { originX: 0, originY: y, width: width, height: newHeight } }],
        { compress: 1, format: SaveFormat.PNG }
      );

      if (facing === 'front') {
          photo = await manipulateAsync(
              photo.localUri || photo.uri,
              [
                  { rotate: 180 },
                  { flip: FlipType.Vertical },
              ],
              { compress: 1, format: SaveFormat.PNG }
          );
      }
      setPhoto(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }

  async function handleUsePhoto() {
    if (photo) {
      try {
        // Then navigate with the photo
        router.push({
          pathname: path as any,
          params: { 
            newPhotoUri: photo
          }
        });
      } catch (error) {
        console.error('Error saving photo:', error);
        alert('Failed to save photo');
      }
    }
  }

  if (photo) {
    return (
      <View className="flex-1 bg-black">
        <Image 
          source={{ uri: photo }} 
          className="flex-1 bottom-[5%]" 
          resizeMode='contain'
        />
        <View className="absolute bottom-0 left-0 right-0 top-[75%] bg-black/50">
          <View className="flex-row justify-between mt-24 m-8">
            <TouchableOpacity 
              className="px-6 py-3 bg-white/30 rounded-full active:bg-white/40"
              onPress={() => setPhoto(null)}
            >
              <Text className="text-white font-semibold text-base">Retake</Text>
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
    );
  }

  return (
    <View className="flex-1 bg-black/50">
      <View className="flex-1">
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing} 
          zoom={zoom}
          flash={flash}
        />
      </View>
      <View className="absolute left-0 right-0 top-0 bottom-[85%] bg-black/50" />
      <View className="absolute left-0 right-0 top-[75%] bottom-0 bg-black/50 items-center">
        <View className="flex-col items-center w-full px-6 gap-4">
          <View style={styles.zoomContainer}>
            <FontAwesome6 name="magnifying-glass" size={14} color="white" />
            <Slider
              style={styles.zoomSlider}
              minimumValue={0}
              maximumValue={0.3}
              value={zoom}
              onValueChange={setZoom}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#FFFFFF40"
              thumbTintColor="#FFFFFF"
            />
            <FontAwesome6 name="magnifying-glass" size={24} color="white" />
          </View>
          
          <View className="flex-row justify-center items-center w-full">
            <TouchableOpacity
              onPress={() => {
                if (returnPath) {
                  router.push({pathname: returnPath as any})
                } else {
                  router.back()
                }
              }}
              className="absolute left-4"
            >
              <View className="mb-2 w-12 h-12 rounded-full bg-white/20 items-center justify-center border-2 border-white/30">
                <FontAwesome6 name="arrow-left" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/30"
              onPress={takePicture}
            >
              <View className="flex-1 m-2 bg-white rounded-full" />
            </TouchableOpacity>
            
            <View className="absolute right-0 flex-row gap-4">
              <TouchableOpacity 
                className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border-2 border-white/30"
                onPress={() => setFlash((current: FlashMode) => {
                  if (current === 'auto') return 'on';
                  if (current === 'on') return 'off';
                  return 'auto';
                })}
              >
                <FontAwesome6 
                  name={flash === 'on' ? 'bolt' : flash === 'off' ? 'bolt-lightning' : 'bolt'} 
                  size={20} 
                  color={flash === 'off' || flash === 'auto' ? '#FFFFFF40' : 'white'} 
                />
              </TouchableOpacity>
              {lockFront !== 'true' && (
                <TouchableOpacity 
                  className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border-2 border-white/30"
                  onPress={toggleCameraFacing}
                >
                  <FontAwesome6 name="rotate" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  zoomContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  zoomSlider: {
    flex: 1,
    height: 40,
  },
});

export default Camera;
