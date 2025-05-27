import { View, Text, Modal, TextInput, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/SessionContext";
import { CreateGroupModalProps } from "@/types/type";

const CreateGroupModal = ({ visible, onClose, onGroupCreated }: CreateGroupModalProps) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { userMetadata } = useSession();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setIsCreating(true);
    const { data, error } = await supabase
      .from('groups')
      .insert({ 
        name: newGroupName,
        anonymous: !isPrivate && isAnonymous,
        private: isPrivate
      })
      .select();

    const { error: userError } = await supabase
      .from('users_to_groups')
      .insert({ user_id: userMetadata?.id, group_id: data?.[0]?.id });

    if (error || userError) {
      console.error('Error creating group:', error);
    } else {
      const newGroup = {
        id: data?.[0]?.id,
        name: newGroupName,
        size: 1,
        created_at: new Date().toISOString(),
        anonymous: !isPrivate && isAnonymous,
        private: isPrivate
      };
      onGroupCreated(newGroup);
    }

    onClose();
    setNewGroupName('');
    setIsAnonymous(false);
    setIsPrivate(false);
    setIsCreating(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-start items-center bg-black/50 pt-72">
        <View className="w-[90%] max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <Text className="text-2xl font-JakartaSemiBold text-gray-900 mb-4">
            Form A New Tribe
          </Text>
          
          <TextInput
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-4"
            style={{
              fontFamily: "font-JakartaRegular",
              fontSize: 18,
              color: "#333",
              paddingVertical: 8,
              textAlignVertical: 'center'
            }}
            placeholder="Enter a name for your tribe"
            value={newGroupName}
            onChangeText={setNewGroupName}
            autoFocus
          />

          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-gray-700 font-JakartaMedium">Private</Text>
              <Text className="text-gray-500 text-sm">Only approved members can join</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#767577', true: '#34D399' }}
              thumbColor={isPrivate ? '#fff' : '#f4f3f4'}
            />
          </View>

          {!isPrivate && (
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-JakartaMedium">Anonymous</Text>
                <Text className="text-gray-500 text-sm">Members' identities will be hidden</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#767577', true: '#34D399' }}
                thumbColor={isAnonymous ? '#fff' : '#f4f3f4'}
              />
            </View>
          )}
          
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={() => {
                onClose();
                setNewGroupName('');
                setIsAnonymous(false);
                setIsPrivate(false);
              }}
              className="px-5 py-2.5 rounded-lg"
            >
              <Text className="text-gray-600 font-JakartaSemiBold">
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={isCreating || !newGroupName.trim()}
              className="px-5 py-2.5 bg-green-500 rounded-lg shadow-sm active:bg-green-600 disabled:opacity-50"
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-JakartaSemiBold">
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateGroupModal;
