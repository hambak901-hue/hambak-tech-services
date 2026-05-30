// HAMBAK TECH GLOBAL API MATRIX GATEWAY
const LIVE_API_URL = "https://hambak-tech-services.onrender.com/api";

// Unified Auth Headers Factory
const getAuthHeaders = () => {
  const token = localStorage.getItem("hambak_token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

const API = {
  // Authentication Matrix Calls
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${LIVE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    },
    
    register: async (userData) => {
      const response = await fetch(`${LIVE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      return await response.json();
    },
    
    getProfile: async () => {
      const response = await fetch(`${LIVE_API_URL}/auth/me`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      return await response.json();
    }
  },

  // Services Matrix Tracking
  services: {
    getAll: async () => {
      const response = await fetch(`${LIVE_API_URL}/services`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      return await response.json();
    }
  }
};

// Export to window execution memory spaces for login.html and dashboard.html scripts
window.API = API;
window.LIVE_API_URL = LIVE_API_URL;
