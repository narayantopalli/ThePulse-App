import { useSession } from "@/contexts/SessionContext";
import { Image } from "react-native";

const SmallProfilePhoto = ({ isAnonymous = false }: { isAnonymous?: boolean }) => {
    const { profilePhotoURL } = useSession();

    return (
    <Image
        source={
        profilePhotoURL && !isAnonymous
            ? { uri: profilePhotoURL }
            : require("assets/images/avatar-default-icon.png")
        }
    style={{
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 8
    }}
    />
    );
};

export default SmallProfilePhoto;
