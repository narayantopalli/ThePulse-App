import React, { useState, useEffect } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View } from "react-native";
import { router } from "expo-router";
import GenderOption from "@/components/buttons/genderOption";

const GenderEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [gender, setGender] = useState(userMetadata?.gender || "");

  const OnConfirm = async () => {
    if (userMetadata?.id) {
      try {
        setUserMetadata({ ...userMetadata, gender: gender });
          
        // Update users table
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ gender: gender })
          .eq('id', userMetadata?.id);
        if (profileErr) throw profileErr;
      } catch (error) {
        console.error(error);
      }
      router.replace("/settings");
    }
  };

  return (
    <View className="flex-1 bg-general-300">
      <View className="flex-1 mx-4 mt-4">
        <GenderOption
          title="He/Him"
          onPress={() => {
            setGender("He/Him");
          }}
          isSelected={gender === "He/Him"}
        />
        <GenderOption
          title="She/Her"
          onPress={() => {
            setGender("She/Her");
          }}
          isSelected={gender === "She/Her"}
        />
        <GenderOption
          title="They/Them"
          onPress={() => {
            setGender("They/Them");
          }}
          isSelected={gender === "They/Them"}
        />

        <NiceButton
          title="Confirm Pronouns"
          onPress={OnConfirm}
          className="mt-6"
          bgVariant="success"
        />
      </View>
    </View>
  );
};

export default GenderEdit; 