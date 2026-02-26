import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==============================================
// AUTH APIs
// ==============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ==============================================
// EXPENSE APIs
// ==============================================
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  parseNaturalLanguage: (data) => api.post('/expenses/parse', data),
};

// ==============================================
// BUDGET APIs
// ==============================================
export const budgetAPI = {
  getAll: (params) => api.get('/budget', { params }),
  create: (data) => api.post('/budget', data),
  update: (id, data) => api.put(`/budget/${id}`, data),
  delete: (id) => api.delete(`/budget/${id}`),
};

// ==============================================
// ANALYTICS APIs
// ==============================================
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getInsights: () => api.get('/analytics/insights'),
};

// ==============================================
// CHATBOT APIs (FinBot)
// ==============================================
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data),
  getChatHistory: (params) => api.get('/chatbot/history', { params }),
  toggleStar: (id) => api.put(`/chatbot/${id}/star`),
  deleteChat: (id) => api.delete(`/chatbot/${id}`),
  clearHistory: () => api.delete('/chatbot/clear'),
};

// ==============================================
// PURCHASE ADVISOR APIs
// ==============================================
export const advisorAPI = {
  analyzePurchase: (data) => api.post('/advisor/purchase-check', data),
  getHealthScore: () => api.get('/advisor/health-score'),
};

// ==============================================
// ACADEMY APIs (Gamified Learning)
// ==============================================
export const academyAPI = {
  getAllCourses: () => api.get('/academy/courses'),
  getCourse: (id) => api.get(`/academy/courses/${id}`),
  enrollCourse: (id) => api.post(`/academy/courses/${id}/enroll`),
  completeChapter: (courseId, chapterNumber, data) => 
    api.post(`/academy/courses/${courseId}/chapters/${chapterNumber}/complete`, data),
  getProgress: () => api.get('/academy/progress'),
  getLeaderboard: (params) => api.get('/academy/leaderboard', { params }),
};

// ==============================================
// PLANNER APIs (Financial Goals)
// ==============================================
export const plannerAPI = {
  getAllGoals: (params) => api.get('/planner/goals', { params }),
  getGoal: (id) => api.get(`/planner/goals/${id}`),
  createGoal: (data) => api.post('/planner/goals', data),
  updateGoal: (id, data) => api.put(`/planner/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/planner/goals/${id}`),
  addContribution: (id, data) => api.post(`/planner/goals/${id}/contribute`, data),
  regenerateAI: (id) => api.post(`/planner/goals/${id}/regenerate-ai`),
  getInsights: () => api.get('/planner/insights'),
};

// ==============================================
// SCHEMES APIs (Government Schemes)
// ==============================================
export const schemesAPI = {
  getAll: () => api.get('/schemes'),
};

export default api;