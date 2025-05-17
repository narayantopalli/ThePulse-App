import React, { useState, useEffect } from "react";
import InputField from "@/components/inputField";
import { images } from "@/constants";
import { router } from "expo-router";
import { ScrollView, Text, View, Image, TouchableOpacity, Modal, Keyboard, TextInput, Alert } from "react-native";
import { icons } from "@/constants";
import NiceButton from "@/components/buttons/niceButton";
import { User } from "@/types/type";
import { supabase } from "@/utils/supabase";
import DateTimePicker from '@react-native-community/datetimepicker';
import GenderOption from "@/components/buttons/genderOption";
import { useSession } from "@/contexts/SessionContext";
import ProfilePhoto from "@/components/profilePhoto";
import * as ImagePicker from "expo-image-picker";

const Setup = () => {
  const { userMetadata, setUserMetadata, updateProfilePhoto } = useSession();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    birthday: new Date(),
    gender: ""
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return "";
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
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
    if (form.firstname === "") {
      return setError("First name is required!");
    }
    if (form.lastname === "") {
      return setError("Last name is required!");
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const OnSignUpPress = async () => {
    Keyboard.dismiss();
    setError("");
    const validationError = validateBirthday(form.birthday);
    if (validationError) {
      return setError(validationError);
    }
    if (!form.gender) {
      return setError("Gender is required!");
    }
    
    const { data, error } = await supabase.from('profiles').update({
      firstname: form.firstname,
      lastname: form.lastname,
      birthday: formatDateToYYYYMMDD(form.birthday),
      gender: form.gender,
    }).eq('id', userMetadata?.id)

    setUserMetadata({
      ...userMetadata,
      firstname: form.firstname,
      lastname: form.lastname,
      birthday: formatDateToYYYYMMDD(form.birthday),
      gender: form.gender,
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

    Keyboard.dismiss();
    
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus === 'granted' && libraryStatus === 'granted') {
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
    <View className="flex-1 bg-white">
      <View>
        <Image source={images.getStarted} className="z-0 w-full h-[250px]" />
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Account Setup
        </Text>
      </View>
        <View className="p-5">
          {step === 1 && (
            <>
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                icon={icons.person}
                value={form.firstname}
                onChangeText={(value) => setForm({ ...form, firstname: value })}
              />
              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                icon={icons.person}
                value={form.lastname}
                onChangeText={(value) => setForm({ ...form, lastname: value })}
              />
            </>
          )}

          {step === 2 && (
            <>
              <View className="mb-4">
                <Text className="text-black text-xl font-JakartaMedium mb-2">Birthday</Text>
                <View className="bg-white border-2 border-black rounded-2xl h-12 p-2 justify-center">
                  <Text className="text-black text-xl font-JakartaMedium">
                    {formatDateToYYYYMMDD(form.birthday)}
                  </Text>
                </View>
                <DateTimePicker
                  value={form.birthday}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              </View>

              <View className="mb-4">
                <Text className="text-black text-xl font-JakartaMedium mb-2">Pronouns</Text>
                <View className="flex-row flex-wrap justify-center">
                  <GenderOption
                    title="He/Him"
                    onPress={() => {
                      setForm({ ...form, gender: "He/Him" });
                    }}
                    isSelected={form.gender === "He/Him"}
                  />
                  <GenderOption
                    title="She/Her"
                    onPress={() => {
                      setForm({ ...form, gender: "She/Her" });
                    }}
                    isSelected={form.gender === "She/Her"}
                  />
                  <GenderOption
                    title="They/Them"
                    onPress={() => {
                      setForm({ ...form, gender: "They/Them" });
                    }}
                    isSelected={form.gender === "They/Them"}
                  />
                </View>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View className="items-center justify-center mt-12">
                <Text className="text-black text-xl font-JakartaMedium mb-4 text-center">
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

          <View className="mt-6 flex-row justify-between">
            {step > 1 && (
              <NiceButton 
                title="Back" 
                onPress={handleBack} 
                className="flex-1 mr-2"
              />
            )}
            <NiceButton 
              title={step < 3 ? "Next" : "Sign Up"} 
              onPress={step < 3 ? handleNext : OnSignUpPress} 
              className={"flex-1 ml-2"}
              bgVariant={step === 2 ? "success" : "primary"}
            />
          </View>
          {error && (
            <Text className="text-red-500 text-center mt-4">{error}</Text>
          )}
        </View>
    </View>
  );
};

export default Setup;
