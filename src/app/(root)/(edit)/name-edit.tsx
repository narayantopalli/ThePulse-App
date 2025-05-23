import React, { useState, useEffect, useRef } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput } from "react-native";
import { router } from "expo-router";

const NameEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [firstName, setFirstName] = useState(userMetadata?.firstname || "");
  const [lastName, setLastName] = useState(userMetadata?.lastname || "");
  const firstNameRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus the first name input when component mounts
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

        // Update users table
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
    <View className="flex-1 bg-general-300">
      <View className="flex-1 mx-4 mt-4">
          <View className="space-y-4">
              <View className="bg-white border-2 border-black rounded-2xl h-16 p-4">
                  <TextInput
                      ref={firstNameRef}
                      className="text-black text-xl font-JakartaMedium"
                      placeholder="First name..."
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCorrect={true}
                      autoCapitalize="sentences"
                  />
              </View>
              <View className="bg-white border-2 border-black rounded-2xl h-16 p-4 mt-4">
                  <TextInput
                      className="text-black text-xl font-JakartaMedium"
                      placeholder="Last name..."
                      value={lastName}
                      onChangeText={setLastName}
                      autoCorrect={true}
                      autoCapitalize="sentences"
                  />
              </View>
          </View>
          <NiceButton
              title="Confirm Name"
              onPress={OnConfirm}
              className="mt-6"
              bgVariant="success"
          />
      </View>
    </View>
  );
};

export default NameEdit; 