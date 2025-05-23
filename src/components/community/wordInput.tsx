import React from 'react';
import { Keyboard, TextInput, View, TouchableOpacity, Modal, Text, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";

const WordInput = () => {
    const [word, setWord] = useState("");
    const [showNoWordsModal, setShowNoWordsModal] = useState(false);
    const { location, userMetadata, setUserMetadata } = useSession();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 0.4,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmerAnimation.start();

        return () => shimmerAnimation.stop();
    }, []);

    const shimmerStyle = {
        backgroundColor: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['#EAB308', '#FCD34D', '#EAB308'], // Different shades of yellow
        }),
    };

    const handleWordChange = (text: string) => {
        const singleWord = text.split(" ")[0];
        setWord(singleWord);
    };

    const handleSubmit = async () => {
        if (word.trim().length === 0) return;
        if (userMetadata?.words_left === 0) {
            setShowNoWordsModal(true);
            return;
        }
        if (!location) return;
        if (word.trim()) {
            Keyboard.dismiss();
        }
        const { error } = await supabase.from("words").insert({
            word: word,
            latitude: location[0],
            longitude: location[1],
        });
        if (error) {
            console.error(error);
            return;
        }
        const { error: updateError } = await supabase.from("profiles").update({
            words_left: userMetadata?.words_left ? userMetadata.words_left - 1 : 0,
        }).eq("id", userMetadata?.id);
        if (updateError) {
            console.error(updateError);
        }
        setUserMetadata({
            ...userMetadata,
            words_left: userMetadata?.words_left ? userMetadata.words_left - 1 : 0,
        });
        setWord("");
    };

    return (
        <>
            <View className="w-4/5 flex-row items-center bg-gray-800/95 rounded-2xl shadow-lg overflow-hidden">
                <TextInput
                    value={word}
                    onChangeText={handleWordChange}
                    placeholder="What's your vibe?"
                    className="flex-1 p-5 text-white"
                    style={{
                        fontSize: 16,
                        fontWeight: '500',
                    }}
                    placeholderTextColor="#94A3B8"
                    maxLength={20}
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                />
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="h-16 justify-center"
                >
                    <Animated.View
                        style={shimmerStyle}
                        className="h-full px-6 justify-center"
                    >
                        <MaterialCommunityIcons name="send" size={24} color="white" />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showNoWordsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNoWordsModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/70">
                    <View className="bg-gray-800 rounded-2xl p-6 w-[90%] max-w-[400px]">
                        <Text className="text-xl font-JakartaSemiBold mb-4 text-center text-white">Out of Words</Text>
                        <Text className="text-gray-300 mb-6 text-center">
                            You've used all your words for today. Come back tomorrow for more!
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowNoWordsModal(false)}
                            className="bg-blue-500 px-4 py-2 rounded-lg self-center"
                        >
                            <Text className="text-white font-JakartaMedium">Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default WordInput;
