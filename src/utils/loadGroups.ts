import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export const loadMyGroupsFromDatabase = async (user_id: string, setMyGroups: (value: any[]) => void) => {
    const { data, error } = await supabase
        .from('users_to_groups')
        .select('group:groups(id, name, size, created_at, anonymous, private)')
        .eq('user_id', user_id)
        .eq('member', true);
    if (data) {
        const transformedData = data.map(item => item.group);
        setMyGroups(transformedData);
        AsyncStorage.setItem(`my_groups_${user_id}`, JSON.stringify(transformedData));
    }
}
  
export const loadMyGroupsFromLocalStorage = async (user_id: string, setMyGroups: (value: any[]) => void) => {
    const storedGroups = await AsyncStorage.getItem(`my_groups_${user_id}`);
    if (storedGroups) {
        setMyGroups(JSON.parse(storedGroups));
    }
}

export const loadGroupRequestsFromDatabase = async (user_id: string, setGroupRequests: (value: any[]) => void) => {
    const { data, error } = await supabase
        .from('users_to_groups')
        .select('group:groups(id, name, size, created_at, anonymous, private)')
        .eq('user_id', user_id)
        .eq('member', false);
    if (data) {
        const transformedData = data.map(item => item.group);
        setGroupRequests(transformedData);
        AsyncStorage.setItem(`group_requests_${user_id}`, JSON.stringify(transformedData));
    }
}

export const loadGroupRequestsFromLocalStorage = async (user_id: string, setGroupRequests: (value: any[]) => void) => {
    const storedGroupRequests = await AsyncStorage.getItem(`group_requests_${user_id}`);
    if (storedGroupRequests) {
        setGroupRequests(JSON.parse(storedGroupRequests));
    }
}
