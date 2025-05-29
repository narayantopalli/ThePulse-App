import Constants from "expo-constants";
import { getLocalImageURI } from "@/utils/getImage";

const getFeed = async (session: { access_token: string }, currentFeed: any[], latitude: number, longitude: number, searchRadius: number, blockedPosts: any[], numPostsToAdd: number, channel: string): Promise<any[]> => {
  try {
    if (!session?.access_token) return currentFeed;
    
      const { newFeed } = await nextFeed(session, currentFeed, latitude, longitude, searchRadius, blockedPosts, numPostsToAdd, channel);

      if (newFeed.length !== 0) {
        const newFeedWithUserMetadata = await Promise.all(newFeed.map(async (post: any) => ({
          ...post,
          data: {
            ...post.data,
          image_url: post.data.image_url ? await getLocalImageURI(post.data.image_url) : null
        },
        user_data: post.user_data ? {
          ...post.user_data,
            avatar_url: post.user_data.avatar_url ? await getLocalImageURI(post.user_data.avatar_url) : null
          } : null
        })));
        return [...currentFeed, ...newFeedWithUserMetadata];
      }
      return currentFeed;
    } catch (error) {
      console.error('Error fetching feed:', error);
      return currentFeed;
    }
};

const nextFeed = async (session: any, feed: any, latitude: number, longitude: number, searchRadius: number, blockedPosts: any[], numPostsToAdd: number, channel: string) => {
  const response = await fetch(`${Constants.expoConfig?.extra?.supabaseUrl}/functions/v1/get-suggested-posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentFeed: feed,
      location: { latitude, longitude },
      searchRadius,
      blockedPosts,
      numPostsToAdd,
      channel
    }),
  });

  if (!response.ok) {
    console.log('Failed to fetch feed');
    return { newFeed: [], user: session.user };
  }

  const res = await response.json();
  return res;
}

export { getFeed, nextFeed };
