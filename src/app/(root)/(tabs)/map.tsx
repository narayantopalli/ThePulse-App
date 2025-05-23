import { Text, View } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect, useMemo } from "react";
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';
import CustomMapView from "@/components/map/MapView";
import { resetFeed } from "@/utils/nextFeed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createHotspots from "@/utils/createHotspots";

const Map = () => {
  const { location, feed, setFeed, searchRadius, blockedPosts, userMetadata, session } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [locationObject, setLocationObject] = useState<Location.LocationObject | null>(null);

  const hotspots = useMemo(() => {
    if (!feed || feed.length === 0) return [];
    return createHotspots(feed);
  }, [feed]);

  useEffect(() => {
    if (location) {
      (async () => {
        const newFeed = await resetFeed(session, location[0], location[1], searchRadius, blockedPosts, 10);
        setFeed(newFeed);
        AsyncStorage.setItem(`feed_${userMetadata?.id}`, JSON.stringify(newFeed));
      })();
    }
  }, [searchRadius]);

  useEffect(() => {
    if (!location) return;
    setRegion({
      latitude: location[0],
      longitude: location[1],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  useEffect(() => {
    if (!location) return;

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
  }, [location, hotspots]);

  return (
    <View className="flex-1 bg-general-300">
      {errorMsg ? (
        <Text className="text-red-500 p-4">{errorMsg}</Text>
      ) : (
        <CustomMapView region={region} setRegion={setRegion} location={locationObject} hotspots={hotspots}/>
      )}
    </View>
  );
};

export default Map;
