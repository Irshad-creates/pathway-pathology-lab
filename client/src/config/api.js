// API Configuration
// Vite replaces import.meta.env.VITE_* at build time with actual values

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL_RAW = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const API_BASE = `${API_URL}/api`;
const SOCKET_URL = SOCKET_URL_RAW;

export { API_BASE, SOCKET_URL };

