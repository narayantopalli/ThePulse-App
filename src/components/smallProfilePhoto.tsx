import { useSession } from "@/contexts/SessionContext";
import { Image, StyleSheet } from "react-native";
import { StyleProp, ImageStyle } from "react-native";

const SmallProfilePhoto = ({ isAnonymous = false, styles = {}}: { isAnonymous?: boolean, styles?: StyleProp<ImageStyle> }) => {
    const { profilePhotoURL } = useSession();

    return (
    <Image
        source={
        profilePhotoURL && !isAnonymous
            ? { uri: profilePhotoURL }
            : require("assets/images/avatar-default-icon.png")
        }
        style={[{
            width: 40,
            height: 40,
            borderRadius: 20,
        }, styles]}
    />
    );
};

export default SmallProfilePhoto;
