import axios from 'axios';

const API_URL = 'https://api.jesusterinodev.com/api/daily-records/';

export interface DailyRecord {
    id?: number;
    date: string;
    journalText: string;
    completedHabitIds: number[];
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
}

const getTodayRecord = async (username: string): Promise<DailyRecord> => {
    const response = await axios.get(API_URL + username + '/today', { withCredentials: true });
    return response.data;
};

const finalizeDay = async (username: string, record: DailyRecord): Promise<DailyRecord> => {
    const response = await axios.post(API_URL + username + '/finalize', record, { withCredentials: true });
    return response.data;
};

const getHistory = async (username: string): Promise<DailyRecord[]> => {
    const response = await axios.get(API_URL + username + '/history', { withCredentials: true });
    return response.data;
};

const DailyRecordService = {
    getTodayRecord,
    finalizeDay,
    getHistory
};

export default DailyRecordService;
