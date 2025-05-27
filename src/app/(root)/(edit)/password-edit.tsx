import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/buttons/backButton";
import { Ionicons } from '@expo/vector-icons';

const PasswordEdit = () => {
  const { session, userMetadata } = useSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"verify" | "new">("verify");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const verifyOldPassword = async () => {
    if (session?.user?.email) {
      try {
        setError("");
        const { error } = await supabase.auth.signInWithPassword({
          email: session?.user?.email,
          password: oldPassword,
        });
        if (error) {
          setOldPassword("");
          setError("Incorrect password. Please try again.");
          return;
        }
        setStep("new");
        setOldPassword("");
      } catch (error) {
        setOldPassword("");
        setError("An error occurred. Please try again.");
      }
    }
  };

  const OnConfirm = async () => {
    if (session?.user) {
      try {
        setError("");
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) {
          setNewPassword("");
          setError("Failed to update password. Please try again.");
          return;
        }
        router.replace("/settings");
      } catch (error) {
        setNewPassword("");
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="flex flex-row items-center bg-white px-4 h-14 shadow-sm">
          <BackButton onPress={() => router.replace("/settings")} />
          <Text className="text-xl font-JakartaBold ml-2">Change Password</Text>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-500 font-JakartaMedium mb-4 text-sm">
            {step === "verify" ? "VERIFY CURRENT PASSWORD" : "ENTER NEW PASSWORD"}
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm font-JakartaMedium">
              {step === "verify" ? "Current Password" : "New Password"}
            </Text>
            <TextInput
              ref={inputRef}
              placeholder={step === "verify" ? "Enter current password" : "Enter new password"}
              secureTextEntry
              value={step === "verify" ? oldPassword : newPassword}
              onChangeText={step === "verify" ? setOldPassword : setNewPassword}
              style={{ 
                minHeight: 32,
                fontFamily: "font-JakartaRegular",
                fontSize: 18,
                color: "#333",
                textAlignVertical: 'center'
              }}
            />
          </View>

          {error ? (
            <View className="flex-row items-center mt-4">
              <Ionicons name="alert-circle" size={20} color="#EF4444" className="mr-2" />
              <Text className="text-red-500 text-sm font-JakartaMedium">{error}</Text>
            </View>
          ) : null}

          <View className="mt-8">
            <TouchableOpacity
              onPress={step === "verify" ? verifyOldPassword : OnConfirm}
              className={`p-4 rounded-xl shadow-sm flex-row items-center justify-center ${
                step === "verify" && oldPassword === "" ? "bg-gray-300" : "bg-blue-500"
              }`}
              disabled={step === "verify" && oldPassword === ""}
            >
              <Ionicons name="checkmark" size={24} color="white" className="mr-2" />
              <Text className="text-white text-lg font-JakartaMedium">
                {step === "verify" ? "Verify Password" : "Save New Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PasswordEdit; 