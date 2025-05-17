import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import BackButton from "../buttons/backButton";

const SharedHeaderOptions = ({ goBackPath }: { goBackPath: string }) => {
  return (
    <View className="flex flex-row justify-between items-center bg-general-900 px-4 h-12">
      <View className="flex-row items-center">
        <BackButton onPress={() => goBackPath ? router.replace(goBackPath) : router.back()} />
      </View>
      <TouchableOpacity onPress={() => router.replace("/profile")}>
        <SmallProfilePhoto />
      </TouchableOpacity>
    </View>
  );
};

export default SharedHeaderOptions;
