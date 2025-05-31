import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GroupItemProps } from '@/types/type';
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

const GroupItem = ({ item, isMember, isRequestingJoin, onJoin, onLeave, onShowMembers, numRequests, setNumRequests }: GroupItemProps) => {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
        });
    };

    useEffect(() => {
        const fetchNumRequests = async () => {
            const { count, error } = await supabase
                .from('users_to_groups')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', item.id)
                .eq('member', false);
            if (error) {
                console.error('Error fetching number of requests:', error);
            } else {
                setNumRequests(count || 0);
            }
        };
        if (isMember && !isRequestingJoin) {
            fetchNumRequests();
        }
    }, [item.id, isMember, isRequestingJoin]);
    

    return (
        <View className="flex-row items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 h-20">
            <View className="flex-1">
                <View className="flex-row items-center space-x-2">
                    <Text className="text-gray-900 text-lg font-JakartaMedium mr-2">
                        {item.name}
                    </Text>
                    {item.anonymous && (
                        <Ionicons name="eye-off" size={16} color="#6B7280" />
                    )}
                    {item.private && (
                        <Ionicons name="lock-closed" size={16} color="#6B7280" />
                    )}
                </View>
                <View className="flex-row items-center space-x-2">
                    <Text className="text-gray-500 text-sm font-JakartaRegular">
                    {item.size} members
                    </Text>
                    <Text className="text-gray-400 text-xs mx-2">•</Text>
                    <Text className="text-gray-500 text-sm font-JakartaRegular">
                    Created {formatDate(item.created_at)}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center space-x-2">
                {isMember && !isRequestingJoin && (
                    <View className="relative mr-4">
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onShowMembers(item);
                            }}
                            className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
                        >
                            <Ionicons name="people" size={20} color="#4B5563" />
                        </TouchableOpacity>
                        {numRequests > 0 && (
                            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full items-center justify-center w-6 h-6">
                                <Text className="text-white text-xs font-JakartaSemiBold">
                                    {numRequests > 99 ? '99+' : numRequests}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                <TouchableOpacity
                    onPress={(e) => {
                    e.stopPropagation();
                    if (isRequestingJoin) {
                        onLeave(item.id, true);
                    } else {
                        isMember ? onLeave(item.id, false) : onJoin(item.id);
                    }
                    }}
                    className={`py-2.5 rounded-lg shadow-sm w-20 ${
                    isRequestingJoin 
                        ? 'bg-gray-500 active:bg-gray-600'
                        : isMember
                        ? 'bg-red-600 active:bg-red-700'
                        : 'bg-green-500 active:bg-green-600'
                    }`}
                >
                    <Text className="text-center text-white text-sm font-JakartaSemiBold tracking-wide">
                    {isRequestingJoin ? 'Request' : (!isMember ? 'Join' : 'Leave')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GroupItem;
