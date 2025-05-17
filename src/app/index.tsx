import { Redirect } from "expo-router"; 
import { useSession } from "@/contexts/SessionContext";

const App = () => {
    const { userMetadata, loading } = useSession();

    if (loading) {
        return null;
    }

    return <Redirect href={userMetadata ? userMetadata.firstname  ? "/(root)/(tabs)/home": "/(auth)/setup" : "/(auth)/welcome"} />;
};

export default App;
