import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/objectives/';

export type SubtaskStatus = 'PENDING' | 'DOING' | 'DONE';

export interface Subtask {
    id?: number;
    title: string;
    status: SubtaskStatus;
}

export interface Book {
    id?: number;
    title: string;
    description: string;
    currentPage: number;
    totalPages: number;
    completed: boolean;
}

export interface Objective {
    id?: number;
    title: string;
    description: string;
    type: 'GENERAL' | 'READING' | 'LIST' | 'FINANCIAL' | 'SKILL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    deadline?: string;
    currentPage?: number;
    totalPages?: number;
    subtasks?: Subtask[];
    books?: Book[];
}

const getObjectives = async (username: string): Promise<Objective[]> => {
    const response = await axios.get(API_URL + username, { withCredentials: true });
    return response.data;
};

const addObjective = async (username: string, objective: Partial<Objective>): Promise<Objective> => {
    const response = await axios.post(API_URL + username, objective, { withCredentials: true });
    return response.data;
};

const updateBookProgress = async (bookId: number, currentPage: number): Promise<Objective> => {
    const response = await axios.patch(`${API_URL}books/${bookId}?currentPage=${currentPage}`, {}, { withCredentials: true });
    return response.data;
};

const updateObjective = async (id: number, objective: Partial<Objective>): Promise<Objective> => {
    const response = await axios.put(API_URL + id, objective, { withCredentials: true });
    return response.data;
};

const updateSubtaskStatus = async (subtaskId: number, status: SubtaskStatus): Promise<Objective> => {
    const response = await axios.patch(`${API_URL}subtasks/${subtaskId}?status=${status}`, {}, { withCredentials: true });
    return response.data;
};

const deleteObjective = async (id: number): Promise<void> => {
    await axios.delete(API_URL + id, { withCredentials: true });
};

const ObjectiveService = {
    getObjectives,
    addObjective,
    updateBookProgress,
    updateObjective,
    updateSubtaskStatus,
    deleteObjective,
};

export default ObjectiveService;
