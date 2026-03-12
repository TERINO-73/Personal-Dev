import axios from 'axios';
import type { Exercise } from './exercise.service';
import type { RoutineAssignment } from './routine.service';

const API_URL = 'https://api.jesusterinodev.com/api/workouts';

export interface SetEntry {
    id?: number;
    workoutSessionId?: number;
    exerciseId: number;
    exercise?: Exercise;
    setIndex?: number;
    reps: number;
    weightKg?: number;
    rpe?: number;
    createdAt?: string;
}

export interface WorkoutSession {
    id: number;
    userId: number;
    routineAssignmentId?: number;
    routineAssignment?: RoutineAssignment;
    date: string;
    startedAt: string;
    finishedAt?: string;
    notes?: string;
    sets: SetEntry[];
}

const startSession = async (routineAssignmentId?: number): Promise<WorkoutSession> => {
    const body = routineAssignmentId ? { routineAssignmentId } : {};
    const response = await axios.post(`${API_URL}/start`, body, { withCredentials: true });
    return response.data;
};

const getSession = async (sessionId: number): Promise<WorkoutSession> => {
    const response = await axios.get(`${API_URL}/${sessionId}`, { withCredentials: true });
    return response.data;
};

const addSet = async (sessionId: number, set: Partial<SetEntry>): Promise<SetEntry> => {
    const response = await axios.post(`${API_URL}/${sessionId}/sets`, set, { withCredentials: true });
    return response.data;
};

const deleteSet = async (sessionId: number, setId: number): Promise<void> => {
    await axios.delete(`${API_URL}/${sessionId}/sets/${setId}`, { withCredentials: true });
};

const finishSession = async (sessionId: number): Promise<WorkoutSession> => {
    const response = await axios.post(`${API_URL}/${sessionId}/finish`, {}, { withCredentials: true });
    return response.data;
};

const WorkoutService = {
    startSession,
    getSession,
    addSet,
    deleteSet,
    finishSession
};

export default WorkoutService;
