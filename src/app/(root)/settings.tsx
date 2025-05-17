import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import NiceButton from "@/components/buttons/niceButton";
import BackButton from "@/components/buttons/backButton";
import { supabase } from "@/utils/supabase";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const [sureLogout, setSureLogout] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (sureLogout) {
      timeoutId = setTimeout(() => {
        setSureLogout(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sureLogout]);

  const handleLogout = async () => {
    if (sureLogout) {
      await supabase.auth.signOut();
      router.replace("/(auth)/welcome");
    } else {
      setSureLogout(true);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-general-900">
      <View className="flex-1 bg-general-600">
        <View className="flex flex-row justify-between items-center bg-general-900 px-4 h-12">
          <View className="flex-row items-center mr-4">
            <BackButton onPress={() => router.replace("/(root)/(tabs)/profile")} />
          </View>
          <SmallProfilePhoto />
        </View>
        <ScrollView className="flex-1 bg-general-600">
          <View className="p-5">
            <NiceButton
              title="Change Name"
              onPress={() => {router.replace("/(edit)/name-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Birthday"
              onPress={() => {router.replace("/(edit)/birthday-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Pronouns"
              onPress={() => {router.replace("/(edit)/gender-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Password"
              onPress={() => {router.replace("/(edit)/password-edit")}}
              className="mt-6"
            />
            <NiceButton
              title={sureLogout ? "Confirm Logout" : "Logout"}
              onPress={handleLogout}
              className="mt-6"
              bgVariant="danger"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
