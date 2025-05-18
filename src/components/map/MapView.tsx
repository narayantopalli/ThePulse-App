import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useRef, useEffect, useState } from "react";
import ResetLocationButton from "@/components/map/ResetLocationButton";
import HotspotMarkers from "./HotspotMarkers";
import { useSession } from "@/contexts/SessionContext";
import { Hotspot, CustomMapViewProps } from "@/types/type";

// Function to calculate distance between two points in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Function to cluster activities into hotspots
const createHotspots = (activities: any[]): Hotspot[] => {
  const hotspots: Hotspot[] = [];
  const CLUSTER_RADIUS = 300; // meters
  const MIN_ACTIVITIES = 2; // minimum activities to form a hotspot

  activities.forEach(activity => {

    const [lat, lon] = [activity.latitude, activity.longitude];

    // Find nearby activities
    const nearbyActivities = activities.filter(other => {
      const [otherLat, otherLon] = [other.latitude, other.longitude];
      return calculateDistance(lat, lon, otherLat, otherLon) <= CLUSTER_RADIUS;
    });

    if (nearbyActivities.length >= MIN_ACTIVITIES) {
      // Calculate average position and strength
      const avgLat = nearbyActivities.reduce((sum, a) => {
        return sum + a.latitude;
      }, 0) / nearbyActivities.length;

      const avgLon = nearbyActivities.reduce((sum, a) => {
        return sum + a.longitude;
      }, 0) / nearbyActivities.length;

      // Strength is based on number of nearby activities
      const strength = nearbyActivities.length;

      // Only add if not too close to existing hotspot
      const isTooClose = hotspots.some(hotspot => 
        calculateDistance(hotspot.latitude, hotspot.longitude, avgLat, avgLon) < CLUSTER_RADIUS
      );

      if (!isTooClose) {
        hotspots.push({
          latitude: avgLat,
          longitude: avgLon,
          strength
        });
      }
    }
  });

  return hotspots;
};

const CustomMapView = ({ region, location }: CustomMapViewProps) => {
  const { feed } = useSession();
  const mapRef = useRef<MapView>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchActivities();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (hotspots[0] === undefined && feed.length > 0) {
      const newHotspots = createHotspots(feed);
      setHotspots(newHotspots);
      setIsLoading(false);
    }
  }, [feed, hotspots]);

  const fetchActivities = async () => {
    try {
      if (!location) return;
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const resetMapView = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
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
        provider={PROVIDER_GOOGLE}
        initialRegion={region || undefined}
        showsUserLocation={true}
      >
        <HotspotMarkers hotspots={hotspots} />
      </MapView>
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