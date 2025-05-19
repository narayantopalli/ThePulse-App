import React from 'react';
import { View } from "react-native";
import { Circle } from 'react-native-maps';
import { HotspotMarkersProps } from "@/types/type";

const HotspotMarkers = ({ hotspots }: HotspotMarkersProps) => {

  return (
    <>
      {hotspots.map((hotspot, index) => {
        if (hotspot.latitude === null || hotspot.longitude === null) {
          return null;
        }
        // Scale opacity and size based on strength
        const maxStrength = Math.max(...hotspots.map(h => h.strength));
        const strengthRatio = hotspot.strength / maxStrength;

        const randomOffsetLat = hotspot.latitude + ((1-2*Math.random()) * 0.0003);
        const randomOffsetLon = hotspot.longitude + ((1-2*Math.random()) * 0.0003);

        const randomSizeOffset = 1 + ((1-2*Math.random()) * 0.1);
        
        return (
          <View key={index}>
            <Circle
              center={{
                latitude: randomOffsetLat,
                longitude: randomOffsetLon,
              }}
              radius={300 * strengthRatio * randomSizeOffset} // meters
              strokeWidth={0}
              fillColor={`rgba(255, 255, 0, ${0.1 * strengthRatio})`} // Yellow, more transparent
            />
            <Circle
              center={{
                latitude: randomOffsetLat,
                longitude: randomOffsetLon,
              }}
              radius={200 * strengthRatio * randomSizeOffset} // meters
              strokeWidth={0}
              fillColor={`rgba(255, 165, 0, ${0.3 * strengthRatio})`} // Orange, medium transparency
            />
            <Circle
              center={{
                latitude: randomOffsetLat,
                longitude: randomOffsetLon,
              }}
              radius={100 * strengthRatio * randomSizeOffset} // meters
              strokeWidth={0}
              fillColor={`rgba(255, 0, 0, ${0.6 * strengthRatio})`} // Red, less transparent
            />
          </View>
        );
      })}
    </>
  );
};

export default HotspotMarkers;
