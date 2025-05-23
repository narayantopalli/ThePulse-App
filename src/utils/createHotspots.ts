import { Hotspot } from "@/types/type";

// Function to calculate distance between two points in meters
const calculateDistance = (lat1: number | null, lon1: number | null, lat2: number | null, lon2: number | null) => {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return 0;
    }
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
    const MIN_ACTIVITIES = 3; // minimum activities to form a hotspot

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

export default createHotspots;
