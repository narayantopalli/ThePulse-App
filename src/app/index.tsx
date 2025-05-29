import { Redirect } from "expo-router"; 
import { useSession } from "@/contexts/SessionContext";

const App = () => {
    const { userMetadata, loading } = useSession();

    if (loading) {
        return null;
    }

    return <Redirect href={userMetadata ? userMetadata.birthday  ? "/(root)/(tabs)/home": "/(auth)/setup" : "/(auth)/sign-in"} />;
};

export default App;
