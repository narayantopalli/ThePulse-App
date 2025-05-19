import { images } from "@/constants";
import { router } from "expo-router";
import { Text, View, Image, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userMetadata } = useSession();

  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: GOOGLE_CLIENT_ID,
  //   });
  // }, []);

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error, data: { user } } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        const { data: userData, error: userError } = await supabase.from('profiles')
        .select('*').eq('id', user?.id)

        if (!error) {
          if (userData && userData[0].firstname && userData[0].lastname) {
            router.replace("/(root)/(tabs)/home");
          } else {
            router.replace("/(auth)/setup");
          }
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('No identity token received from Apple');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      setErrorMessage('Apple sign in failed');
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error, data: { user } } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        const { data: userData, error: userError } = await supabase.from('profiles')
          .select('*').eq('id', user?.id);

        if (userData && userData[0].firstname && userData[0].lastname) {
          router.replace("/(root)/(tabs)/home");
        } else {
          router.replace("/(auth)/setup");
        }
      } else {
        setErrorMessage(error.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     console.log(userInfo);
      
  //     if (userInfo.idToken) {
  //       const { error, data: { user } } = await supabase.auth.signInWithIdToken({
  //         provider: 'google',
  //         token: userInfo.idToken,
  //       });

  //       const { data: userData, error: userError } = await supabase.from('profiles')
  //         .select('*').eq('id', user?.id);

  //       if (!error) {
  //         if (userData && userData[0].firstName && userData[0].lastName) {
  //           router.replace("/(root)/(tabs)/home");
  //         } else {
  //           router.replace("/(auth)/setup");
  //         }
  //       } else {
  //         setErrorMessage(error.message);
  //       }
  //     } else {
  //       setErrorMessage('No ID token present!');
  //     }
  //   } catch (error: any) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       // User cancelled the login flow
  //       return;
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       setErrorMessage('Sign in already in progress');
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       setErrorMessage('Play services not available or outdated');
  //     } else {
  //       setErrorMessage('Google sign in failed');
  //     }
  //   }
  // };

  return (
    <View className="flex-1 bg-white">
      <View className="relative">
        <Image 
          source={images.getStarted} 
          className="w-full h-[300px]"
          style={styles.headerImage}
        />
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
          <Text className="text-3xl text-black font-JakartaSemiBold">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-300 mt-2 font-JakartaRegular">
            Choose your preferred sign in method
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

        <View className="flex-1 space-y-8">
          <View className="space-y-5">
            <View>
              <Text className="text-sm text-gray-600 mb-2 font-JakartaMedium">Email</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-2 mt-2 font-JakartaMedium">Password</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 border border-gray-200 rounded-xl font-JakartaRegular bg-gray-50"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <TouchableOpacity 
                onPress={() => router.push("/(auth)/forgot-password")}
                className="mt-2"
              >
                <Text className="text-sm text-gray-600 font-JakartaMedium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="w-full h-14 bg-black rounded-xl items-center justify-center shadow-sm mt-6 mb-4"
              onPress={handleEmailSignIn}
              disabled={isLoading}
              style={styles.signInButton}
            >
              <Text className="text-white font-JakartaSemiBold text-base">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center space-x-4 mb-1">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="text-gray-500 font-JakartaRegular">or continue with</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <View className="items-center space-y-4">
            {Platform.OS === 'ios' ? (
              <View className="w-full items-center space-y-4">
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={[styles.appleButton, { marginTop: 8 }]}
                  onPress={handleAppleSignIn}
                />
                <Text className="text-sm text-gray-500 font-JakartaRegular mt-2">
                  Secure sign in with your Apple ID
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl text-gray-800 font-JakartaSemiBold mb-2">
                  Coming Soon
                </Text>
                <Text className="text-base text-gray-600 text-center font-JakartaRegular">
                  Apple Sign In is currently only available on iOS devices
                </Text>
              </View>
            )}
          </View>

          <View className="items-center mt-4">
            <Text className="text-gray-600 font-JakartaRegular mb-2">
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              className="px-6 py-2 rounded-full border border-gray-200"
            >
              <Text className="text-black font-JakartaSemiBold">
                Create Account
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
  appleButton: {
    width: '100%',
    height: 50,
    maxWidth: 300,
  },
  googleButton: {
    width: '100%',
    height: 50,
    maxWidth: 300,
  },
  signInButton: {
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

export default SignIn;
