import { View, Text, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import AIButton from './AIButton';
import { getChat } from '@/utils/getChat';
import { useSession } from '@/contexts/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface FeedPost {
  id: string;
  // Add other feed post properties here
}

// Constants
const ANIMATION_CONFIG = {
  SLIDE_OFFSET: -300,
  ANIMATION_DURATION: 200,
  LOADING_DELAY: 2000,
  DOTS_INTERVAL: 500,
} as const;

const PulseAI = () => {
  const { feed, userMetadata } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [chatData, setChatData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dots, setDots] = useState('');
  const [oldFeed, setOldFeed] = useState<FeedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const slideAnim = useRef(new Animated.Value(ANIMATION_CONFIG.SLIDE_OFFSET)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadOldFeed = async () => {
      if (userMetadata?.id) {
        try {
          const storedFeed = await AsyncStorage.getItem(`feed_${userMetadata.id}`);
          if (storedFeed) {
            setOldFeed(JSON.parse(storedFeed));
          }
        } catch (error) {
          console.error('Error loading old feed:', error);
          setError('Failed to load previous feed data');
        }
      }
    };
    loadOldFeed();
  }, [userMetadata]);

  useEffect(() => {
    const fetchChat = async () => {
        try {
            const newFeedIds = feed.map(post => post.id);
            const oldFeedIds = oldFeed.map(post => post.id);
            const allPostsInOldFeed = newFeedIds.every(id => oldFeedIds.includes(id));
            if (((!allPostsInOldFeed) ||
                (feed.length > 0 && chatData.length === 0)) && !isFetching) {
                setIsFetching(true);
                setOldFeed(feed);
                console.log("Fetching response from AI...");
                if (userMetadata?.id) {
                    try {
                        await AsyncStorage.setItem(`feed_${userMetadata.id}`, JSON.stringify(feed));
                    } catch (error) {
                        console.error('Error saving feed:', error);
                        setError('Failed to save feed data');
                    }
                }
                const result = await getChat({ feed: feed, setIsFetching: setIsFetching });
                setChatData(result);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
            setError('Failed to analyze feed');
        } finally {
            setIsLoading(false);
        }
    };
    fetchChat();
  }, [feed, userMetadata]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
    }
    if (chatData.length > 0) {
      if (isVisible) {
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, ANIMATION_CONFIG.LOADING_DELAY);
        return () => clearTimeout(timer);
      }
    }
  }, [chatData, isVisible]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, ANIMATION_CONFIG.DOTS_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.ANIMATION_DURATION,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: ANIMATION_CONFIG.SLIDE_OFFSET,
          duration: ANIMATION_CONFIG.ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: ANIMATION_CONFIG.ANIMATION_DURATION,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  return (
    <View className="absolute bottom-24 left-0 right-0">
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
          position: 'absolute',
          left: '5%',
          right: '20%',
          bottom: 0,
          backgroundColor: '#3b82f6',
          borderRadius: 20,
          padding: 10,
          height: 56,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={isLoading ? "Analyzing feed" : "AI analysis complete"}
      >
        <View className="flex-row items-center ml-12">
            <Text 
            className="text-white font-JakartaMedium text-center"
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
            numberOfLines={2} 
            ellipsizeMode="tail"
            style={{ fontSize: 16 }}
            >
                {error ? error : 
                isLoading || chatData.length === 0 ? 
                `Analyzing the pulse${dots}` : 
                chatData}
            </Text>
        </View>
      </Animated.View>
      
      <AIButton onPress={() => setIsVisible(!isVisible)} />
    </View>
  );
};

export default PulseAI;
