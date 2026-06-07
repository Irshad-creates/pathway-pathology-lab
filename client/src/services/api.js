import axios from "axios";
import { API_BASE } from "../config/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  patientLogin: (name, mobile) =>
    api.post("/auth/patient-login", { name, mobile }),
};

export const testAPI = {
  getAll: () => api.get("/tests"),
  getByCategory: (category) => api.get(`/tests/category/${category}`),
  getFavourite: () => api.get("/tests/favourite"),
  seed: () => api.post("/tests/seed"),
};

export const patientAPI = {
  create: (data) => api.post("/patients", data),
  search: (params) => api.get("/patients/search", { params }),
  getSuggestions: (query) =>
    api.get("/patients/suggestions", { params: { query } }),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const registrationAPI = {
  create: (data) => api.post("/registration", data),
  search: (params) => api.get("/registration/search", { params }),
  getById: (id) => api.get(`/registration/${id}`),
  update: (id, data) => api.put(`/registration/${id}`, data),
  delete: (id) => api.delete(`/registration/${id}`),
};

export const staffAPI = {
  create: (data) => api.post("/staff", data),
  getAll: () => api.get("/staff"),
  disable: (id) => api.put(`/staff/${id}/disable`),
  resetPassword: (id, data) => api.put(`/staff/${id}/reset-password`, data),
  changePassword: (data) => api.put("/staff/change-password", data),
};

export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

export const reportsAPI = {
  getDailySummary: (date) =>
    api.get("/reports/daily-summary", { params: { date } }),
  getDateRange: (fromDate, toDate) =>
    api.get("/reports/date-range", { params: { fromDate, toDate } }),
  getPaymentSummary: (fromDate, toDate) =>
    api.get("/reports/payment-summary", { params: { fromDate, toDate } }),
};

export const patientPortalAPI = {
  getMyTests: () => api.get("/patient-portal/my-tests"),
  getRegistration: (id) => api.get(`/patient-portal/registration/${id}`),
  updateProfile: (data) => api.put("/patient-portal/profile", data),
  getLabStatus: () => api.get("/patient-portal/lab-status"),
};

export default api;
