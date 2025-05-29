import React, { useState } from "react";
import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View, Image, TouchableOpacity, Keyboard, Alert, TextInput, Platform } from "react-native";
import { icons } from "@/constants";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import DateTimePicker from '@react-native-community/datetimepicker';
import PronounsOption from "@/components/buttons/pronounsOption";
import { useSession } from "@/contexts/SessionContext";
import ProfilePhoto from "@/components/profilePhoto";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';

const Setup = () => {
  const { firstname, lastname } = useLocalSearchParams();
  const { userMetadata, setUserMetadata, updateProfilePhoto } = useSession();
  const [form, setForm] = useState({
    firstname: firstname ? String(firstname) : "",
    lastname: lastname ? String(lastname) : "",
    birthday: new Date(),
    pronouns: ""
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateToDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const validateBirthday = (date: Date) => {
    const today = new Date();
    if (date > today) {
      return "Birthday cannot be in the future";
    }
    const age = today.getFullYear() - date.getFullYear();
    if (age > 120) {
      return "Please enter a realistic birthday";
    }
    if (age < 12) {
      return "You must be at least 12 years old to use this app";
    }
    return "";
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      const validationError = validateBirthday(selectedDate);
      if (validationError) {
        setError(validationError);
        return;
      }
      setForm({ ...form, birthday: selectedDate });
      setError("");
    }
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (form.firstname === "") {
        return setError("First name is required!");
      }
      if (form.lastname === "") {
        return setError("Last name is required!");
      }
    }
    if (step === 2) {
      const validationError = validateBirthday(form.birthday);
      if (validationError) {
        return setError(validationError);
      }
      if (!form.pronouns) {
        return setError("Pronouns are required!");
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const OnSignUpPress = async () => {
    Keyboard.dismiss();    
    const { data, error } = await supabase.from('profiles').update({
      firstname: form.firstname,
      lastname: form.lastname,
      birthday: formatDateToYYYYMMDD(form.birthday),
      pronouns: form.pronouns,
    }).eq('id', userMetadata?.id)

    setUserMetadata({
      ...userMetadata,
      firstname: form.firstname,
      lastname: form.lastname,
      birthday: formatDateToYYYYMMDD(form.birthday),
      pronouns: form.pronouns,
    });

    if (profilePhoto) {
      await updateProfilePhoto({
        canceled: false,
        assets: [
          {
            uri: profilePhoto,
            width: 1,
            height: 1,
            type: "image",
          },
        ],
      } as any);
    }

    if (error) return setError(error.message);

    router.replace("/(root)/(tabs)/home");
  };

  const pickImage = async () => {

    setError("");
    Keyboard.dismiss();

    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryStatus === 'granted') {
      const source = await new Promise(resolve => {
        resolve("library");
      });

      if (source === "library") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
          exif: false,
        });

        if (result.assets && result.assets.length > 0) {
          setProfilePhoto(result.assets[0].uri);
        }
      }
    } else {
      Alert.alert("Permission Required", "Camera and photo library permissions are required to use this feature");
    }
  };


  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row items-center bg-white px-4 h-14 shadow-sm">
          {step > 1 && <BackButton onPress={handleBack} />}
          <Text className="text-xl font-JakartaBold ml-2">Account Setup</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          {step === 1 && (
            <>
              <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">YOUR NAME</Text>
              <View className="space-y-4">
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <Text className="text-gray-500 text-sm font-JakartaMedium mb-1">First Name</Text>
                  <TextInput
                    placeholder="Enter first name"
                    value={form.firstname}
                    onChangeText={(value) => setForm({ ...form, firstname: value })}
                    autoCorrect={true}
                    autoCapitalize="words"
                    style={{ 
                      minHeight: 32,
                      fontFamily: "font-JakartaRegular",
                      fontSize: 14,
                      color: "#333",
                      textAlignVertical: 'center'
                    }}
                  />
                </View>

                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="text-gray-500 text-sm font-JakartaMedium mb-1">Last Name</Text>
                  <TextInput
                    placeholder="Enter last name"
                    value={form.lastname}
                    onChangeText={(value) => setForm({ ...form, lastname: value })}
                    autoCorrect={true}
                    autoCapitalize="words"
                    style={{ 
                      minHeight: 32,
                      fontFamily: "font-JakartaRegular",
                      fontSize: 14,
                      color: "#333",
                      textAlignVertical: 'center'
                    }}
                  />
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">YOUR DETAILS</Text>
              <View className="space-y-4">
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <Text className="text-gray-500 text-sm font-JakartaMedium mb-1">Birthday</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-800 text-lg font-JakartaMedium">
                      {formatDateToDisplay(form.birthday)}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#4B5563" />
                  </View>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={form.birthday}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    style={Platform.OS === 'ios' ? { height: 200 } : undefined}
                  />
                )}

                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="text-gray-500 text-sm font-JakartaMedium mb-2">Pronouns</Text>
                  <View className="space-y-2">
                    <TouchableOpacity
                      onPress={() => setForm({ ...form, pronouns: "He/Him" })}
                      className={`bg-gray-50 p-4 rounded-xl flex-row items-center justify-between ${
                        form.pronouns === "He/Him" ? 'border-2 border-blue-500' : ''
                      }`}
                    >
                      <Text className="text-gray-800 text-lg font-JakartaMedium">He/Him</Text>
                      {form.pronouns === "He/Him" && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setForm({ ...form, pronouns: "She/Her" })}
                      className={`bg-gray-50 p-4 rounded-xl flex-row items-center justify-between ${
                        form.pronouns === "She/Her" ? 'border-2 border-blue-500' : ''
                      }`}
                    >
                      <Text className="text-gray-800 text-lg font-JakartaMedium">She/Her</Text>
                      {form.pronouns === "She/Her" && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setForm({ ...form, pronouns: "They/Them" })}
                      className={`bg-gray-50 p-4 rounded-xl flex-row items-center justify-between ${
                        form.pronouns === "They/Them" ? 'border-2 border-blue-500' : ''
                      }`}
                    >
                      <Text className="text-gray-800 text-lg font-JakartaMedium">They/Them</Text>
                      {form.pronouns === "They/Them" && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">PROFILE PHOTO</Text>
              <View className="bg-white rounded-xl p-6 shadow-sm items-center">
                <Text className="text-black text-xl font-JakartaMedium mb-2 text-center">
                  Add a Profile Photo
                </Text>
                <Text className="text-gray-600 text-base font-JakartaRegular mb-6 text-center px-4">
                  Choose a photo that represents you best. You can always change it later.
                </Text>
                <TouchableOpacity 
                  className="items-center justify-center"
                  onPress={pickImage}
                >
                  <View className="flex-row items-center justify-center">
                    <ProfilePhoto radius={100} profilePhotoURL={profilePhoto || ''} />
                  </View>
                </TouchableOpacity>
                <Text className="text-gray-500 text-sm font-JakartaRegular mt-4">
                  Tap to change photo
                </Text>
              </View>
            </>
          )}

          <View className="mt-8">
            <TouchableOpacity
              onPress={step < 3 ? handleNext : OnSignUpPress}
              className="bg-blue-500 p-4 rounded-xl shadow-sm flex-row items-center justify-center"
            >
              <Text className="text-white text-lg font-JakartaMedium">
                {step < 3 ? "Next" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {error && (
            <Text className="text-red-500 text-center mt-4 font-JakartaMedium">{error}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Setup;
