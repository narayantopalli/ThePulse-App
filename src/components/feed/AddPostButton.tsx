import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';

const AddPostButton = () => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/(edit)/create-post",
        });
      }}
      className="absolute bottom-24 self-end mr-4 bg-general-900 w-16 h-16 rounded-full justify-center items-center shadow-lg"
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <MaterialIcons name="add" size={32} color="black" />
    </TouchableOpacity>
  );
};

export default AddPostButton;
