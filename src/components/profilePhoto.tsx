import { View, Image } from "react-native";

const ProfilePhoto = ({
  radius,
  profilePhotoURL,
}: {
  radius: number;
  profilePhotoURL: string;
}) => {

  return (
    <View className="items-center justify-center flex-1">
      <View className="items-center">
        <Image
          source={
            profilePhotoURL
              ? { uri: profilePhotoURL }
              : require("assets/images/avatar-default-icon.png")
          }
          style={{
            width: 2 * radius,
            height: 2 * radius,
            borderRadius: radius,
            borderColor: "black",
            borderWidth: 2,
          }}
        />
      </View>
    </View>
  );
};

export default ProfilePhoto;
