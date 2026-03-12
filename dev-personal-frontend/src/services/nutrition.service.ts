import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/nutrition/';

export interface NutritionProfile {
    id?: number;
    weight: number;
    height: number;
    sex: string;
    activityLevel: string;
    goal: string;
    age: number;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
}

export interface DailyFoodEntry {
    id: number;
    food: any;
    date: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface DayNutritionResponse {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    entries: DailyFoodEntry[];
}

const getProfile = async (username: string): Promise<NutritionProfile> => {
    const response = await axios.get(`${API_URL}${username}/profile`, { withCredentials: true });
    return response.data;
};

const saveProfile = async (username: string, profile: NutritionProfile): Promise<NutritionProfile> => {
    const response = await axios.post(`${API_URL}${username}/profile`, profile, { withCredentials: true });
    return response.data;
};

const getDayInfo = async (username: string, date: string): Promise<DayNutritionResponse> => {
    const response = await axios.get(`${API_URL}${username}/day/${date}`, { withCredentials: true });
    return response.data;
};

const addFoodToDay = async (username: string, req: { foodId: number, grams: number, date: string }): Promise<DailyFoodEntry> => {
    const response = await axios.post(`${API_URL}${username}/day/addFood`, req, { withCredentials: true });
    return response.data;
};

const resetMacros = async (username: string): Promise<NutritionProfile> => {
    const response = await axios.post(`${API_URL}${username}/profile/reset`, {}, { withCredentials: true });
    return response.data;
};

const removeFoodFromDay = async (username: string, entryId: number): Promise<void> => {
    await axios.delete(`${API_URL}${username}/day/${entryId}`, { withCredentials: true });
};

const NutritionService = {
    getProfile,
    saveProfile,
    getDayInfo,
    addFoodToDay,
    removeFoodFromDay,
    resetMacros
};

export default NutritionService;
