import { Text, View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect } from "react";
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';
import CustomMapView from "@/components/map/MapView";

const Map = () => {
  const { loading, location } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [locationObject, setLocationObject] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    if (!location) return;
    
    setRegion({
      latitude: location[0],
      longitude: location[1],
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    });

    setLocationObject({
      coords: {
        latitude: location[0],
        longitude: location[1],
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    });
  }, [location]);

  if (loading) return null;

  return (
    <View className="flex-1 bg-general-300">
      {errorMsg ? (
        <Text className="text-red-500 p-4">{errorMsg}</Text>
      ) : (
        <CustomMapView region={region} location={locationObject} />
      )}
    </View>
  );
};

export default Map;
