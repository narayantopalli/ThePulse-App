import Constants from "expo-constants";
import * as Location from 'expo-location';

export const getLocationString = async (location: [number, number]) => {
    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
    const radius = 100;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location[0]},${location[1]}&radius=${radius}&type=point_of_interest&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results?.length > 0) {
      const closestPlace = data.results[0];
      return closestPlace.name;
    } else {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location[0],
        longitude: location[1]
      });

      if (address) {
        const locationString = [
          address.street,
          address.city,
          address.region
        ].filter(Boolean).join(', ');
        return locationString;
      }
    }
    return null;
}
