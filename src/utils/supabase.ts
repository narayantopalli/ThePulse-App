import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'

export const supabase = createClient(Constants.expoConfig?.extra?.supabaseUrl, Constants.expoConfig?.extra?.supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    onAuthStateChange: (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery
        const url = Linking.getInitialURL();
        if (url) {
          // The URL contains the recovery token
          // Supabase will automatically handle the token
        }
      }
    }
  },
})
