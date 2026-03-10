import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

const register = async (name: string, username: string, email: string, password: string): Promise<User> => {
  const response = await axios.post(API_URL + 'register', {
    name,
    username,
    email,
    password,
  }, { withCredentials: true });
  return response.data;
};

const login = async (usernameOrEmail: string, password: string): Promise<User> => {
  const response = await axios.post(API_URL + 'login', {
    usernameOrEmail,
    password,
  }, { withCredentials: true });
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = (): void => {
  localStorage.removeItem('user');
};

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
