import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/stats';

export interface DailyWorkoutSnapshot {
    id: number;
    userId: number;
    date: string;
    totalExercises: number;
    totalSets: number;
    totalReps: number;
    totalVolumeKg: number;
    jsonDetails?: string;
}

const getDailySnapshot = async (date: string): Promise<DailyWorkoutSnapshot | null> => {
    const response = await axios.get(`${API_URL}/daily?date=${date}`, { withCredentials: true });
    return response.data || null; // Return null if 204 No Content
};

const getRangeSnapshots = async (from: string, to: string): Promise<DailyWorkoutSnapshot[]> => {
    const response = await axios.get(`${API_URL}/range?from=${from}&to=${to}`, { withCredentials: true });
    return response.data;
};

const GymStatsService = {
    getDailySnapshot,
    getRangeSnapshots
};

export default GymStatsService;
