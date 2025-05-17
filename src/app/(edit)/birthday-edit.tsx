import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import NiceButton from "@/components/buttons/niceButton";

const BirthdayEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [error, setError] = useState("");

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
    return "";
  };

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
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
    <View className="flex-1 bg-general-600">
      <View className="flex-1 mx-4 mt-4">
        <View className="bg-white border-2 border-black rounded-2xl h-16 p-4 justify-center">
          <Text 
            className="text-black text-xl font-JakartaMedium"
          >
            {formatDateToYYYYMMDD(birthday)}
          </Text>
        </View>
        
        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />

        <NiceButton
          title="Confirm Birthday"
          onPress={OnConfirm}
          className="mt-6"
          bgVariant="success"
        />
        {error ? (
          <Text className="text-red-500 mt-2 text-sm">{error}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default BirthdayEdit; 