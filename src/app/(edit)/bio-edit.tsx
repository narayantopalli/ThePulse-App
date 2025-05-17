import React, { useState, useEffect, useRef } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput } from "react-native";
import { router } from "expo-router";

const BioEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [bio, setBio] = useState(userMetadata?.bio || "");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus the input when component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const OnConfirm = async () => {
    if (userMetadata?.id) {
      try {
        setUserMetadata({ ...userMetadata, bio: bio });
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ bio: bio })
          .eq('id', userMetadata?.id);
        if (profileErr) throw profileErr;
      } catch (error) {
        console.error(error);
      }
      router.replace("/(root)/(tabs)/profile");
    }
  };

  return (
    <View className="flex-1 bg-general-600">
      <View className="flex-1 mx-4 mt-4">
          <View className="bg-white border-2 border-black rounded-2xl h-48 p-4">
              <TextInput
                  ref={inputRef}
                  className="text-black text-xl font-JakartaMedium"
                  placeholder="Write something about yourself..."
                  multiline
                  value={bio}
                  onChangeText={(e) => {
                      setBio(e);
                  }}
              />
          </View>
      <NiceButton
          title="Confirm Bio"
          onPress={OnConfirm}
          className="mt-6"
          bgVariant="success"
      />
      </View>
    </View>
  );
};

export default BioEdit;
