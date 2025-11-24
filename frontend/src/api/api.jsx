import axios from "axios";

const REPLIT_DEV_DOMAIN = "7b527c1e-7d5e-433a-8740-0f04ec8143d1-00-3cs6hem46d233.spock.replit.dev";
const API_BASE_URL = `https://${REPLIT_DEV_DOMAIN}/api/v1/`;

const api = axios.create({
  baseURL: API_BASE_URL,
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
