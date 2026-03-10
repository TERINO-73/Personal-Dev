import axios from 'axios';

const API_URL = 'http://localhost:8080/api/habits/';

export interface Habit {
  id: string;
  name: string;
  type: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

const getHabits = async (username: string): Promise<Habit[]> => {
    const response = await axios.get(API_URL + username, { withCredentials: true });
    return response.data;
};

const addHabit = async (username: string, habit: Partial<Habit>): Promise<Habit> => {
    const response = await axios.post(API_URL + username, habit, { withCredentials: true });
    return response.data;
};

const toggleHabit = async (id: string): Promise<Habit> => {
    const response = await axios.patch(`${API_URL}${id}/toggle`, {}, { withCredentials: true });
    return response.data;
};

const deleteHabit = async (id: string): Promise<void> => {
    await axios.delete(API_URL + id, { withCredentials: true });
};

const HabitService = {
    getHabits,
    addHabit,
    toggleHabit,
    deleteHabit,
};

export default HabitService;
