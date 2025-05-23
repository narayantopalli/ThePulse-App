import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import SmallProfilePhoto from "@/components/smallProfilePhoto";
import BackButton from "../buttons/backButton";
import { useSession } from "@/contexts/SessionContext";

const SharedHeaderOptions = ({ goBackPath }: { goBackPath: string }) => {
  const { isAnonymous } = useSession();

  return (
    <View className="flex flex-row justify-between items-center bg-white px-4 h-12">
      <View className="flex-row items-center">
        <BackButton onPress={() => goBackPath ? router.replace(goBackPath) : router.back()} />
      </View>
      <TouchableOpacity onPress={() => router.replace("/profile")}>
        <View className="mb-2 border-2 border-black rounded-full">
          <SmallProfilePhoto isAnonymous={isAnonymous} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SharedHeaderOptions;
