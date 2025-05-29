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
import { Ionicons } from '@expo/vector-icons';
// import { useRevenueCat } from "@/providers/RevenueCat";
// import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";


const Settings = () => {
  const [sureLogout, setSureLogout] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { userMetadata } = useSession();
  // const { isPro } = useRevenueCat();

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
      router.replace("/(auth)/sign-in");
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
      router.replace("/(auth)/sign-in");
      setShowDeleteModal(false);
    }
  };

  // const goPro = async() => {
  //   const paywallResult = await RevenueCatUI.presentPaywall();

  //   console.log(paywallResult);

  //   switch (paywallResult) {
  //     case PAYWALL_RESULT.NOT_PRESENTED:
  //     case PAYWALL_RESULT.ERROR:
  //     case PAYWALL_RESULT.CANCELLED:
  //       return false;
  //     case PAYWALL_RESULT.PURCHASED:
  //     case PAYWALL_RESULT.RESTORED:
  //       return true;
  //     default:
  //       return false;
  //   }
  // };

  const SettingItem = ({ title, onPress, icon }: { title: string; onPress: () => void; icon: string }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
    >
      <Ionicons name={icon as any} size={24} color="#4B5563" className="mr-3" />
      <Text className="text-gray-700 text-lg font-JakartaMedium flex-1">{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row justify-between items-center bg-white px-4 h-14 shadow-sm">
          <View className="flex-row items-center">
            <BackButton onPress={() => router.replace("/(root)/(tabs)/profile")} />
            <Text className="text-xl font-JakartaBold ml-2">Settings</Text>
          </View>
          <SmallProfilePhoto />
        </View>
        
        <ScrollView className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">PROFILE SETTINGS</Text>
          <SettingItem 
            title="Edit Name" 
            onPress={() => router.replace("/(root)/(edit)/name-edit")}
            icon="person-outline"
          />
          <SettingItem 
            title="Edit Birthday" 
            onPress={() => router.replace("/(root)/(edit)/birthday-edit")}
            icon="calendar-outline"
          />
          <SettingItem 
            title="Edit Pronouns" 
            onPress={() => router.replace("/(root)/(edit)/pronouns-edit")}
            icon="people-outline"
          />
          <View className="mt-8 mb-4">
            <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">ACCOUNT</Text>
            <SettingItem 
              title="Change Password" 
              onPress={() => router.replace("/(root)/(edit)/password-edit")}
              icon="lock-closed-outline"
            />
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
            >
              <Ionicons name="log-out-outline" size={24} color="#4B5563" className="mr-3" />
              <Text className="text-gray-700 text-lg font-JakartaMedium flex-1">
                {sureLogout ? "Confirm Logout" : "Logout"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" className="mr-3" />
              <Text className="text-red-500 text-lg font-JakartaMedium flex-1">Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white m-4 p-6 rounded-2xl w-[85%]">
              <Text className="text-2xl font-JakartaBold mb-2">Delete Account</Text>
              <Text className="text-gray-600 mb-6 font-JakartaMedium">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </Text>
              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="px-6 py-3"
                >
                  <Text className="text-gray-600 font-JakartaMedium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  className="bg-red-500 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-JakartaMedium">Delete Account</Text>
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
