import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // change if your backend runs on another port
  headers: {
    "Content-Type": "application/x-www-form-urlencoded", // default for OAuth2 form login
  },
});

// Optional: attach token to every request if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
