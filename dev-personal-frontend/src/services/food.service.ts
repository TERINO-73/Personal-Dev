import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/foods';

export interface Food {
    id: number;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    barcode?: string;
}

const getAllFoods = async (): Promise<Food[]> => {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data;
};

const createFood = async (food: Partial<Food>): Promise<Food> => {
    const response = await axios.post(API_URL, food, { withCredentials: true });
    return response.data;
};

const getFoodByBarcode = async (barcode: string): Promise<Food> => {
    const response = await axios.get(`${API_URL}/barcode/${barcode}`, { withCredentials: true });
    return response.data;
};

const FoodService = {
    getAllFoods,
    createFood,
    getFoodByBarcode
};

export default FoodService;
