import { images } from "@/constants";
import { router } from "expo-router";
import { Text, View, Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import BackButton from "@/components/buttons/backButton";
import * as Linking from "expo-linking";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const url = Linking.createURL('/(auth)/reset-password');
      console.log("URL:", url);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: url,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Password reset instructions have been sent to your email");
        setEmail("");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred while sending reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative">
        <Image 
          source={images.getStarted} 
          className="w-full h-[300px]"
          style={styles.headerImage}
        />
        <View className="absolute top-12 left-4">
          <BackButton onPress={() => router.replace("/(auth)/sign-in")} />
        </View>
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
          <Text className="text-3xl text-black font-JakartaSemiBold">
            Reset Password
          </Text>
          <Text className="text-base text-gray-300 mt-2 font-JakartaRegular">
            Enter your email to receive reset instructions
          </Text>
        </View>
      </View>

      <View className="flex-1 px-6 pt-8">
        {errorMessage ? (
          <View className="bg-red-50 p-4 rounded-lg mb-6 border border-red-100">
            <Text className="text-red-500 text-center font-JakartaMedium">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {successMessage ? (
          <View className="bg-green-50 p-4 rounded-lg mb-6 border border-green-100">
            <Text className="text-green-600 text-center font-JakartaMedium">
              {successMessage}
            </Text>
          </View>
        ) : null}

        <View className="flex-1 space-y-8">
          <View className="space-y-5">
            <View>
              <Text className="text-sm text-gray-600 mb-2 font-JakartaMedium">Email</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 border border-gray-200 rounded-xl bg-gray-50"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    fontFamily: "font-JakartaRegular",
                    fontSize: 18,
                    color: "#333",
                    paddingVertical: 8,
                    textAlignVertical: 'center'
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              className="w-full h-14 bg-black rounded-xl items-center justify-center shadow-sm mt-6 mb-4"
              onPress={handleResetPassword}
              disabled={isLoading}
              style={styles.resetButton}
            >
              <Text className="text-white font-JakartaSemiBold text-base">
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    resizeMode: 'cover',
  },
  resetButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ForgotPassword;
