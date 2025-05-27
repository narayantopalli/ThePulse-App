import { supabase } from "@/utils/supabase"
import { hashUUID } from "@/utils/idHash"

const loadActivityFromDatabase = async (location: [number, number] | null, searchRadius: number, setActivity: (activity: any[]) => void) => {

    if (!location) {
        setActivity([]);
        return;
    }
    const { data, error } = await supabase.rpc('get_activity', {
        p_lat:location[0],
        p_lon:location[1],
        p_rad: searchRadius
    });

    if (error) {
        console.error(error);
    }

    setActivity(data);
}

const reportActivity = async (location: [number, number], userId: string) => {
    const { error } = await supabase.from('activity').upsert({
        id: await hashUUID(userId),
        latitude: location[0],
        longitude: location[1]
    });
    
    if (error) {
        console.error(error);
    }
}

export { loadActivityFromDatabase, reportActivity };
