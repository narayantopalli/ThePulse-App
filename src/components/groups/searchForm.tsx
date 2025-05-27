import React from 'react';
import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Image, SafeAreaView, TextInput, TouchableOpacity, View, Animated } from "react-native";

const SearchForm = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: any;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const widthAnim = useRef(new Animated.Value(40)).current;

    const expandSearch = () => {
        setIsExpanded(true);
        Animated.spring(widthAnim, {
            toValue: 280,
            useNativeDriver: false,
            tension: 20,
            friction: 7
        }).start();
    };

    const collapseSearch = () => {
        if (!query) {
            setIsExpanded(false);
            Animated.spring(widthAnim, {
                toValue: 40,
                useNativeDriver: false,
                tension: 20,
                friction: 7
            }).start();
        }
    };

    return (
        <Animated.View 
            style={{ width: widthAnim }}
            className="flex flex-row items-center bg-white rounded-full shadow-sm border border-gray-100"
        >
            {!isExpanded ? (
                <TouchableOpacity 
                    onPress={expandSearch}
                    className="w-full h-full items-center justify-center p-1"
                >
                    <Ionicons 
                        name="search" 
                        size={20} 
                        color="#666"
                    />
                </TouchableOpacity>
            ) : (
                <>
                    <Ionicons 
                        name="search" 
                        size={18} 
                        color="#666" 
                        style={{ marginRight: 8, marginLeft: 8 }}
                    />
                    <TextInput
                        style={{
                            fontFamily: "font-JakartaSemiBold",
                            fontSize: 18,
                            flex: 1,
                            color: "#333",
                            paddingVertical: 8,
                            textAlignVertical: 'center'
                        }}
                        placeholder="Search tribes..."
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={(text) => setQuery(text)}
                        autoCorrect={false}
                        autoComplete="off"
                        onBlur={collapseSearch}
                        autoFocus={true}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => {
                                setQuery("");
                                setIsExpanded(false);
                                Animated.spring(widthAnim, {
                                    toValue: 40,
                                    useNativeDriver: false,
                                    tension: 20,
                                    friction: 7
                                }).start();
                            }}
                            className="p-2"
                        >
                            <Ionicons 
                                name="close-circle" 
                                size={18} 
                                color="#999" 
                            />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </Animated.View>
    );
};

export default SearchForm;
