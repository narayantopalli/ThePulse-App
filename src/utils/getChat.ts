import { FeedPost } from '@/types/type';
import { supabase } from './supabase';
import Constants from 'expo-constants';

interface GetChatParams {
  feed: FeedPost[];
  setIsFetching: (isFetching: boolean) => void;
}

export const getChat = async ({ feed, setIsFetching }: GetChatParams): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/aichat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feed }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error in getChat:', error);
    throw error;
  } finally {
    setIsFetching(false);
  }
};
