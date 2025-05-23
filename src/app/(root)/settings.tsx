import { View, ScrollView, TouchableOpacity, Text, Modal, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import NiceButton from "@/components/buttons/niceButton";
import BackButton from "@/components/buttons/backButton";
import { supabase } from "@/utils/supabase";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import { SafeAreaView } from "react-native-safe-area-context";
import clearAsyncStorage from "@/utils/clearAsyncStorage";
import { useSession } from "@/contexts/SessionContext";
import { useRevenueCat } from "@/providers/RevenueCat";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";


const Settings = () => {
  const [sureLogout, setSureLogout] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { userMetadata } = useSession();
  const { isPro } = useRevenueCat();

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
      if (userMetadata?.id) {
        await clearAsyncStorage(userMetadata.id);
      }
      await supabase.auth.signOut();
      router.replace("/(auth)/welcome");
    } else {
      setSureLogout(true);
    }
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await clearAsyncStorage(user.id);
      await supabase.rpc('delete_user');
      await supabase.auth.signOut();
      router.replace("/(auth)/welcome");
      setShowDeleteModal(false);
    }
  };

  const goPro = async() => {
    const paywallResult = await RevenueCatUI.presentPaywall();

    console.log(paywallResult);

    switch (paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 bg-general-300">
        <View className="flex flex-row justify-between items-center bg-white px-4 h-12">
          <View className="flex-row items-center mr-4">
            <BackButton onPress={() => router.replace("/(root)/(tabs)/profile")} />
          </View>
          <SmallProfilePhoto />
        </View>
        <ScrollView className="flex-1 bg-general-600">
          <View className="p-5">
            <NiceButton
              title="Change Name"
              onPress={() => {router.replace("/(root)/(edit)/name-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Birthday"
              onPress={() => {router.replace("/(root)/(edit)/birthday-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Pronouns"
              onPress={() => {router.replace("/(root)/(edit)/gender-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Change Password"
              onPress={() => {router.replace("/(root)/(edit)/password-edit")}}
              className="mt-6"
            />
            <NiceButton
              title="Unlock Pro Features"
              onPress={() => {goPro()}}
              className="mt-6 bg-amber-500 border-amber-600 text-white font-semibold"
            />
          </View>
        </ScrollView>
        <View className="absolute bottom-16 left-4">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="bg-gray-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-base font-medium">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-16 right-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-base font-medium">
              {sureLogout ? "Confirm Logout" : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white m-4 p-6 rounded-xl w-[80%]">
              <Text className="text-xl font-bold mb-4">Delete Account</Text>
              <Text className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone.
              </Text>
              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="px-4 py-2"
                >
                  <Text className="text-gray-600 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  className="bg-red-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
