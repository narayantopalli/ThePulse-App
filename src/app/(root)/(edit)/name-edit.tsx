import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";

const NameEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [firstName, setFirstName] = useState(userMetadata?.firstname || "");
  const [lastName, setLastName] = useState(userMetadata?.lastname || "");
  const firstNameRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      firstNameRef.current?.focus();
    }, 100);
  }, []);

  const OnConfirm = async () => {
    if (userMetadata?.id) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { first_name: firstName, last_name: lastName }
        });
        if (error) throw error;

        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ first_name: firstName, last_name: lastName })
          .eq('id', userMetadata?.id);
        
        setUserMetadata({ ...userMetadata, firstname: firstName, lastname: lastName });
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
          <Text className="text-xl font-JakartaBold ml-2">Edit Name</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">YOUR NAME</Text>
          
          <View className="space-y-4">
            <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <Text className="text-gray-500 text-sm font-JakartaMedium">First Name</Text>
              <TextInput
                ref={firstNameRef}
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCorrect={true}
                autoCapitalize="words"
                style={{ 
                  minHeight: 32,
                  fontFamily: "font-JakartaRegular",
                  fontSize: 18,
                  color: "#333",
                  textAlignVertical: 'center'
                }}
              />
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-500 text-sm font-JakartaMedium">Last Name</Text>
              <TextInput
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
                autoCorrect={true}
                autoCapitalize="words"
                style={{ 
                  minHeight: 32,
                  fontFamily: "font-JakartaRegular",
                  fontSize: 18,
                  color: "#333",
                  textAlignVertical: 'center'
                }}
              />
            </View>
          </View>

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

export default NameEdit; 