import { supabase } from './supabase';

const getColorsFromWords = async (location: [number, number], searchRadius: number, setColor: any, setColorGradient: any) => {
  const { data, error } = await supabase.rpc('get_words', {
    p_lon: location[1],
    p_lat: location[0],
    p_rad: searchRadius
  });

  if (error) {
    console.error('Error fetching colors:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Extract and average RGB components separately
  const rgbTotals = data.reduce((acc: { r: number, g: number, b: number }, item: any) => {
    const color = item.color_rgb || 0;
    return {
      r: acc.r + ((color >> 16) & 0xFF),
      g: acc.g + ((color >> 8) & 0xFF),
      b: acc.b + (color & 0xFF)
    };
  }, { r: 0, g: 0, b: 0 });

  // Calculate average RGB components
  const r = Math.round(rgbTotals.r / data.length);
  const g = Math.round(rgbTotals.g / data.length);
  const b = Math.round(rgbTotals.b / data.length);

  // Calculate strength based on number of words
  const strength = 1 - Math.exp(-data.length / 10); // Normalize strength between 0 and 1

  // Set the color with the calculated RGB values
  setColor(`rgba(${r},${g},${b},${strength})`);
  setColorGradient(`rgba(${r},${g},${b},${strength**2})`);
};

export default getColorsFromWords;
