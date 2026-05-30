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

  // NEW: PAYSTACK & WALLET TRANSACTION OPERATIONS MATRIX
  transactions: {
    initializeDeposit: async (amount) => {
      const response = await fetch(`${LIVE_API_URL}/transactions/paystack/initialize`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: Number(amount) })
      });
      return await response.json();
    },

    verifyDeposit: async (reference) => {
      const response = await fetch(`${LIVE_API_URL}/transactions/paystack/verify`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reference })
      });
      return await response.json();
    },

    getMyHistory: async () => {
      const response = await fetch(`${LIVE_API_URL}/transactions/my`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      return await response.json();
    }
  },

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

window.API = API;
window.LIVE_API_URL = LIVE_API_URL;

