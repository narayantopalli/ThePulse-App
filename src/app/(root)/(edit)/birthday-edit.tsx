import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';

const BirthdayEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    // Initialize with user's current birthday if available
    if (userMetadata?.birthday) {
      // Convert the stored YYYY-MM-DD string to a Date object
      const [year, month, day] = userMetadata.birthday.split('-').map(Number);
      setBirthday(new Date(year, month - 1, day)); // month is 0-based in Date
    }
  }, [userMetadata]);

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
      setBirthday(selectedDate);
      setError("");
    }
  };

  const OnConfirm = async () => {
    const validationError = validateBirthday(birthday);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (userMetadata?.id) {
      try {
        const formattedBirthday = formatDateToYYYYMMDD(birthday);
        const { error } = await supabase.auth.updateUser({
          data: { birthday: formattedBirthday }
        });
        if (error) throw error;

        // Update users table
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ birthday: formattedBirthday })
          .eq('id', userMetadata?.id);

        setUserMetadata({ ...userMetadata, birthday: formattedBirthday });
        if (profileErr) throw profileErr;
      } catch (error) {
        console.error(error);
      }
      router.replace("/settings");
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row items-center bg-white px-4 h-14 shadow-sm">
          <BackButton onPress={() => router.replace("/settings")} />
          <Text className="text-xl font-JakartaBold ml-2">Edit Birthday</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">YOUR BIRTHDAY</Text>
          
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Text className="text-gray-500 text-sm font-JakartaMedium mb-1">Birthday</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-800 text-lg font-JakartaMedium">
                {formatDateToDisplay(birthday)}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
              style={Platform.OS === 'ios' ? { height: 200 } : undefined}
            />
          )}

          {error ? (
            <Text className="text-red-500 mt-4 text-sm font-JakartaMedium">{error}</Text>
          ) : null}

          <View className="mt-8">
            <TouchableOpacity
              onPress={OnConfirm}
              className="bg-blue-500 p-4 rounded-xl shadow-sm flex-row items-center justify-center"
            >
              <Ionicons name="checkmark" size={24} color="white" className="mr-2" />
              <Text className="text-white text-lg font-JakartaMedium">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BirthdayEdit; 