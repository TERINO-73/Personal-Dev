import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reminders/';

export interface Reminder {
  id: number;
  text: string;
  color: string;
  startTime: string; // ISO LocalDateTime
  endTime: string;   // ISO LocalDateTime
  allDay: boolean;
}

const getReminders = async (username: string): Promise<Reminder[]> => {
  const response = await axios.get(API_URL + username, { withCredentials: true });
  return response.data;
};

const addReminder = async (username: string, reminder: Partial<Reminder>): Promise<Reminder> => {
  const response = await axios.post(API_URL + username, reminder, { withCredentials: true });
  return response.data;
};

const deleteReminder = async (id: number): Promise<void> => {
  await axios.delete(API_URL + id, { withCredentials: true });
};

const ReminderService = {
  getReminders,
  addReminder,
  deleteReminder,
};

export default ReminderService;
