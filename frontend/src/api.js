import axios from "axios";

// Create Axios instance
const axiosInstance = axios.create({

  // baseURL: "http://localhost:5000/api", // Change this to your backend URL
  baseURL: "to-do-list-production-a8c8.up.railway.app", // Change this to your backend URL

});

// Request Interceptor: Attach token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API Endpoints
const api = {
  register: (email, password) => axiosInstance.post("/user/register", { email, password }),
  login: (email, password) => axiosInstance.post("/user/sign-in", { email, password }),
  getTasks: () => axiosInstance.get("/tasks"),
  addTask: (task_text, task_date) => axiosInstance.post("/tasks", { task_text, task_date }),
  markTaskAsDone: (taskId) => axiosInstance.put(`/tasks/${taskId}`),
  deleteTask: (taskId) => axiosInstance.delete(`/tasks/${taskId}`),
};

export default api;
