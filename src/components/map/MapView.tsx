import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Circle } from 'react-native-maps';
import { useRef, useState, useEffect } from "react";
import ResetLocationButton from "@/components/map/ResetLocationButton";
import HotspotMarkers from "./HotspotMarkers";
import { useSession } from "@/contexts/SessionContext";
import { CustomMapViewProps } from "@/types/type";
import VisibilityRadiusButton from "../VisibilityRadiusButton";

const CustomMapView = ({ region, setRegion, location, hotspots }: CustomMapViewProps) => {
  const { searchRadius, setSearchRadius } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    setIsLoading(false);
  }, [hotspots]);

  const resetMapView = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView 
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
      >
        <Circle
          center={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          radius={searchRadius}
          strokeWidth={1}
          fillColor={`rgba(191, 191, 191, 0.3)`}
        />
        <HotspotMarkers hotspots={hotspots} />
      </MapView>
      <View 
        className="absolute bg-transparent bottom-0 w-full h-64"
        pointerEvents="auto"
        onTouchStart={() => {}}
      />
      <VisibilityRadiusButton 
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
      />
      <ResetLocationButton onPress={resetMapView} />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default CustomMapView;
