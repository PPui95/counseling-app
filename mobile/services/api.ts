import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; role: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Sessions (Counselor)
export const sessionService = {
  getAll: (params?: { clientId?: string }) =>
    api.get('/sessions', { params }),
  getById: (id: string) => api.get(`/sessions/${id}`),
  create: (data: object) => api.post('/sessions', data),
  update: (id: string, data: object) => api.put(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

// Clients (Counselor)
export const clientService = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  getProgress: (id: string) => api.get(`/clients/${id}/progress`),
};

// Assessments (Client)
export const assessmentService = {
  getResults: () => api.get('/assessments'),
  submit: (type: string, answers: number[]) =>
    api.post('/assessments', { type, answers }),
};

// Mood Tracking (Client)
export const moodService = {
  getEntries: () => api.get('/mood'),
  record: (mood: number, note?: string) => api.post('/mood', { mood, note }),
};

// Chat
export const chatService = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId: string) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, content: string) =>
    api.post(`/chat/rooms/${roomId}/messages`, { content }),
};

// Users
export const userService = {
  getCounselor: () => api.get('/users/my-counselor'),
};
