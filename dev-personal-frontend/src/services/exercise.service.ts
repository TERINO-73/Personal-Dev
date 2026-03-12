import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/exercises';

export interface Exercise {
    id: number;
    name: string;
    primaryMuscle: string;
    secondaryMuscles?: string;
    equipment?: string;
    description?: string;
    defaultRestSeconds?: number;
    createdById?: number;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const getExercises = async (search?: string, page = 0, size = 50): Promise<PageResponse<Exercise>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await axios.get(`${API_URL}?${params.toString()}`, { withCredentials: true });
    return response.data;
};

const getExerciseById = async (id: number): Promise<Exercise> => {
    const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
    return response.data;
};

const createExercise = async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const response = await axios.post(API_URL, exercise, { withCredentials: true });
    return response.data;
};

const updateExercise = async (id: number, exercise: Partial<Exercise>): Promise<Exercise> => {
    const response = await axios.put(`${API_URL}/${id}`, exercise, { withCredentials: true });
    return response.data;
};

const deleteExercise = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
};

const ExerciseService = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};

export default ExerciseService;
