import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Attach token to every request if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;


// // api.js
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8000/auth", // adjust if needed
// });

// // Attach token automatically
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;
