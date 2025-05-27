import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';

const PronounsEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [pronouns, setPronouns] = useState(userMetadata?.pronouns || "");

  const OnConfirm = async () => {
    if (userMetadata?.id) {
      try {
        setUserMetadata({ ...userMetadata, pronouns: pronouns });
          
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ pronouns: pronouns })
          .eq('id', userMetadata?.id);
        if (profileErr) throw profileErr;
      } catch (error) {
        console.error(error);
      }
      router.replace("/settings");
    }
  };

  const PronounsOption = ({ title, onPress, isSelected }: { title: string; onPress: () => void; isSelected: boolean }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between ${
        isSelected ? 'border-2 border-blue-500' : ''
      }`}
    >
      <Text className="text-gray-800 text-lg font-JakartaMedium">{title}</Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row items-center bg-white px-4 h-14 shadow-sm">
          <BackButton onPress={() => router.replace("/settings")} />
          <Text className="text-xl font-JakartaBold ml-2">Edit Pronouns</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">SELECT YOUR PRONOUNS</Text>
          
          <PronounsOption
            title="He/Him"
            onPress={() => setPronouns("He/Him")}
            isSelected={pronouns === "He/Him"}
          />
          <PronounsOption
            title="She/Her"
            onPress={() => setPronouns("She/Her")}
            isSelected={pronouns === "She/Her"}
          />
          <PronounsOption
            title="They/Them"
            onPress={() => setPronouns("They/Them")}
            isSelected={pronouns === "They/Them"}
          />

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

export default PronounsEdit;
