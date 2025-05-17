import React, { useState, useEffect, useRef } from "react";
import NiceButton from "@/components/buttons/niceButton";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { View, TextInput, Text } from "react-native";
import { router } from "expo-router";

const PasswordEdit = () => {
  const { session, userMetadata } = useSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"verify" | "new">("verify");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus the input when component mounts
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
    <View className="flex-1 bg-general-600">
      <View className="flex-1 mx-4 mt-4">
          <View className="bg-white border-2 border-black rounded-2xl h-64 p-4">
              {step === "verify" ? (
                  <>
                      <Text className="text-black text-xl font-JakartaMedium mb-4">Enter your current password</Text>
                      <View className="bg-white border-2 border-black rounded-2xl h-16 p-4">
                      <TextInput
                          ref={inputRef}
                          className="text-black text-xl font-JakartaMedium"
                          placeholder="Current password..."
                          secureTextEntry
                          value={oldPassword}
                          onChangeText={setOldPassword}
                      />
                      </View>
                      <NiceButton
                          title="Verify Password"
                          onPress={verifyOldPassword}
                          className="mt-8"
                          bgVariant={oldPassword == "" ? "danger" : "primary"}
                      />
                      {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
                  </>
              ) : (
                  <>
                      <Text className="text-black text-xl font-JakartaMedium mb-4">Enter your new password</Text>
                      <View className="bg-white border-2 border-black rounded-2xl h-16 p-4">
                      <TextInput
                          ref={inputRef}
                          className="text-black text-xl font-JakartaMedium"
                          placeholder="New password..."
                          secureTextEntry
                          value={newPassword}
                          onChangeText={setNewPassword}
                      />
                      </View>
                      <NiceButton
                          title="Confirm New Password"
                          onPress={OnConfirm}
                          className="mt-8"
                          bgVariant="danger"
                      />
                      {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
                  </>
              )}
          </View>
      </View>
    </View>
  );
};

export default PasswordEdit; 