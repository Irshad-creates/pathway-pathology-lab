// API Configuration
// Reads from environment variables or uses defaults

// Get API URL from environment or use default
const getApiUrl = () => {
  // Check if running in browser with window object
  if (typeof window !== "undefined" && window.__API_CONFIG__) {
    return window.__API_CONFIG__.backendUrl;
  }

  // Default to localhost
  return "http://localhost:5000";
};

// Get Socket URL from environment or use default
const getSocketUrl = () => {
  // Check if running in browser with window object
  if (typeof window !== "undefined" && window.__API_CONFIG__) {
    return window.__API_CONFIG__.socketUrl;
  }

  // Default to localhost
  return "http://localhost:5000";
};

const API_BASE = `${getApiUrl()}/api`;
const SOCKET_URL = getSocketUrl();

export { API_BASE, SOCKET_URL };
