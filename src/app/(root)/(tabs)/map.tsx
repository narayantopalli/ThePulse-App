import { Text } from "react-native";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect, useMemo } from "react";
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';
import CustomMapView from "@/components/map/MapView";
import createHotspots from "@/utils/createHotspots";
import React from "react";
import { loadActivityFromDatabase } from "@/utils/getActivity";

const Map = () => {
  const { location, searchRadius } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [locationObject, setLocationObject] = useState<Location.LocationObject | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const hotspots = useMemo(() => {
    if (!activity || activity.length === 0) return [];
    return createHotspots(activity);
  }, [activity]);

  useEffect(() => {
    if (location) {
      (async () => {
        await loadActivityFromDatabase(location, searchRadius, setActivity);
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
    <>
      {errorMsg ? (
        <Text className="text-red-500 p-4">{errorMsg}</Text>
      ) : (
        <CustomMapView region={region} setRegion={setRegion} location={locationObject} hotspots={hotspots}/>
      )}
    </>
  );
};

export default Map;
