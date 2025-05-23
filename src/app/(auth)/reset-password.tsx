import { images } from "@/constants";
import { router } from "expo-router";
import { Text, View, Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import BackButton from "@/components/buttons/backButton";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Password has been reset successfully");
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.replace("/(auth)/sign-in");
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred while resetting password");
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
          <BackButton onPress={() => router.back()} />
        </View>
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
          <Text className="text-3xl text-black font-JakartaSemiBold">
            Reset Password
          </Text>
          <Text className="text-base text-gray-300 mt-2 font-JakartaRegular">
            Enter your new password
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
              <Text className="text-sm text-gray-600 mb-2 font-JakartaMedium">New Password</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm text-gray-600 mb-2 font-JakartaMedium">Confirm Password</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
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
                {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
