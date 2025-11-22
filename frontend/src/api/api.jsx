
// export const API_BASE = "https://ideal-space-couscous-pjp5g495xj69c7977-8000.app.github.dev/api";

// export const API_BASE = "http://localhost:8000/api";


import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically if exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

