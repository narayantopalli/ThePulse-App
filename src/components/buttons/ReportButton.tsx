import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/utils/supabase";

const ReportButton = ({ id, type }: { id: string, type: 'post' | 'response' | 'status' }) => {
  const { userMetadata, blockedPosts, setBlockedPosts } = useSession();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = async () => {
    if (!reportReason.trim()) {
      return;
    }
    const { error } = await supabase.from('reports').insert({
      user_id: userMetadata?.id,
      [type === 'post' ? 'post_id' : type === 'response' ? 'response_id' : 'status_id']: id,
      reason: reportReason,
    });
    if (error) {
      console.error('Error reporting post:', error);
    } else {
      if (type === 'post') {
        setBlockedPosts([...blockedPosts, id]);
      }
      setReportModalVisible(false);
      setReportReason("");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setReportModalVisible(true)}
        className="bg-gray-200 rounded-full px-2 py-1 flex-row items-center space-x-1"
      >
        <MaterialIcons 
          name="report" 
          size={16} 
          color="#f4f3f4"
        />
        <Text className="ml-1 text-white font-JakartaMedium text-sm">
          Report
        </Text>
      </TouchableOpacity>
      {reportModalVisible && (
        <Modal
          visible={reportModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px]">
              <Text className="text-xl font-JakartaSemiBold mb-4">Report {type === 'post' ? 'Post' : type === 'response' ? 'Response' : 'Status'}</Text>
              <View className="mb-4">
                <Text className="text-gray-600 mb-2">Reason:</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter reason for report"
                  value={reportReason}
                  onChangeText={setReportReason}
                  multiline
                  numberOfLines={3}
                  style={{
                    fontFamily: "font-JakartaRegular",
                    fontSize: 18,
                    color: "#333",
                    paddingVertical: 8,
                    textAlignVertical: 'center'
                  }}
                />
              </View>

              <View className="flex-row justify-end gap-2 mt-4">
                <TouchableOpacity 
                  onPress={() => {
                    setReportModalVisible(false);
                    setReportReason("");
                  }}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700 font-JakartaMedium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleReport}
                  className={`px-4 py-2 rounded-lg ${!reportReason.trim() ? 'bg-gray-400' : 'bg-blue-500'}`}
                  disabled={!reportReason.trim()}
                >
                  <Text className="text-white font-JakartaMedium">Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default ReportButton;

