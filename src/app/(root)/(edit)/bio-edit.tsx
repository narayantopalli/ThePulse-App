import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';

const MAX_CHARS = 100;

const BioEdit = () => {
  const { userMetadata, setUserMetadata } = useSession();
  const [bio, setBio] = useState(userMetadata?.bio || "");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleBioChange = (text: string) => {
    // Only remove enters and tabs, keep spaces
    const cleanedText = text.replace(/[\r\n\t]/g, '').slice(0, MAX_CHARS);
    
    if (cleanedText.length <= MAX_CHARS) {
      setBio(cleanedText);
    }
  };

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
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row items-center bg-white px-4 h-14 shadow-sm">
          <BackButton onPress={() => router.replace("/(root)/(tabs)/profile")} />
          <Text className="text-xl font-JakartaBold ml-2">Edit Bio</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">YOUR BIO</Text>
          
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm font-JakartaMedium mb-1">About Me</Text>
            <TextInput
              ref={inputRef}
              placeholder="Write something about yourself..."
              multiline
              value={bio}
              autoCorrect={true}
              autoCapitalize="sentences"
              onChangeText={handleBioChange}
              style={{
                fontFamily: "font-JakartaRegular",
                fontSize: 18,
                color: "#333",
                paddingVertical: 8,
                textAlignVertical: 'center'
              }}
            />
            <Text className="text-gray-400 text-sm font-JakartaMedium mt-2 text-right">
              {bio.length}/{MAX_CHARS} characters
            </Text>
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

export default BioEdit;
