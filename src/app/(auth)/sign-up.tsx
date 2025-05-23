import { images } from "@/constants";
import { router } from "expo-router";
import { Text, View, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { useState, useRef } from "react";
import { supabase } from "@/utils/supabase";

const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error, data: { user } } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error) {
        router.replace("/(auth)/sign-in");
      } else {
        setErrorMessage(error.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <View className="flex-1 bg-white">
            <View className="relative">
              <Image 
                source={images.getStarted} 
                className="w-full h-72"
                style={styles.headerImage}
              />
              <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
                <Text className="text-3xl text-black font-JakartaSemiBold">
                  Create Account
                </Text>
                <Text className="text-base text-gray-300 mt-2 font-JakartaRegular">
                  Sign up to get started
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
              <ScrollView className="flex-1 space-y-8" showsVerticalScrollIndicator={false}>
                <View className="space-y-5">
                  <View>
                    <Text className="text-sm text-gray-600 mb-2 font-JakartaMedium">Email</Text>
                    <View className="relative">
                      <TextInput
                        ref={emailRef}
                        className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                      />
                    </View>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-600 mb-2 mt-4 font-JakartaMedium">Password</Text>
                    <View className="relative">
                      <TextInput
                        ref={passwordRef}
                        className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      />
                    </View>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-600 mb-2 mt-4 font-JakartaMedium">Confirm Password</Text>
                    <View className="relative">
                      <TextInput
                        ref={confirmPasswordRef}
                        className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                        onSubmitEditing={handleSignUp}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    className="w-full h-14 bg-black rounded-xl items-center justify-center shadow-sm mt-6 mb-4"
                    onPress={handleSignUp}
                    disabled={isLoading}
                    style={styles.signUpButton}
                  >
                    <Text className="text-white font-JakartaSemiBold text-base">
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="items-center mt-4">
                  <Text className="text-gray-600 font-JakartaRegular mb-2">
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/sign-in")}
                    className="px-6 py-2 rounded-full border border-gray-200"
                  >
                    <Text className="text-black font-JakartaSemiBold">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    resizeMode: 'cover',
  },
  signUpButton: {
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

export default SignUp;
