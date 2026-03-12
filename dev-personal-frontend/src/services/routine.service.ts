import axios from 'axios';
import type { Exercise } from './exercise.service';

const API_URL = 'https://api.jesusterinodev.com/api/routines';

export interface RoutineExercise {
    id?: number;
    routineId?: number;
    exerciseId: number;
    exercise?: Exercise;
    orderIndex?: number;
    defaultSets: number;
    defaultReps: string;
    defaultWeightKg?: number;
    notes?: string;
}

export interface Routine {
    id?: number;
    name: string;
    description?: string;
    createdById?: number;
    isTemplate: boolean;
    createdAt?: string;
    exercises: RoutineExercise[];
}

export interface RoutineAssignment {
    id: number;
    routineId: number;
    routine?: Routine;
    userId: number;
    date: string;
    assignedAt: string;
}

const getRoutines = async (userOnly: boolean = false): Promise<Routine[]> => {
    const response = await axios.get(`${API_URL}?userOnly=${userOnly}`, { withCredentials: true });
    return response.data;
};

const getRoutineById = async (id: number): Promise<Routine> => {
    const response = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
    return response.data;
};

const createRoutine = async (routine: Routine): Promise<Routine> => {
    const response = await axios.post(API_URL, routine, { withCredentials: true });
    return response.data;
};

const updateRoutine = async (id: number, routine: Routine): Promise<Routine> => {
    const response = await axios.put(`${API_URL}/${id}`, routine, { withCredentials: true });
    return response.data;
};

const deleteRoutine = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
};

const assignRoutine = async (id: number, date: string): Promise<RoutineAssignment> => {
    const response = await axios.post(`${API_URL}/${id}/assign`, { date }, { withCredentials: true });
    return response.data;
};

const getAssignments = async (date: string): Promise<RoutineAssignment[]> => {
    const response = await axios.get(`${API_URL}/assignments?date=${date}`, { withCredentials: true });
    return response.data;
};

const unassignRoutine = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/assignments/${id}`, { withCredentials: true });
};

const RoutineService = {
    getRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    assignRoutine,
    getAssignments,
    unassignRoutine
};

export default RoutineService;
