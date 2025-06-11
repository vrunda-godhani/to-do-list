import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://64.227.184.231:4142/api", // Base URL of your API
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (optional)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 or other errors globally
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Redirect to login or handle logout
      localStorage.removeItem("authToken");
      window.location.href = "/"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// // API Functions
// export const api = {
//   // Register User
//   register: async (username, password) => {
//     try {
//       const response = await axiosInstance.post("/register", { username, password });
//       return response.data; // Return the response data
//     } catch (error) {
//       console.error("Error during registration:", error);
//       throw error;
//     }
//   },

//   // Login User
//   login: async (username, password) => {
//     try {
//       const response = await axiosInstance.post("/login", { username, password });
//       localStorage.setItem("authToken", response.data.token); // Save token to localStorage
//       return response.data; // Return the response data
//     } catch (error) {
//       console.error("Error during login:", error);
//       throw error;
//     }
//   },

//   // Get Tasks
//   getTasks: async () => {
//     try {
//       const response = await axiosInstance.get("/tasks");
//       return response.data; // Return the task list
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       throw error;
//     }
//   },

//   // Add Task
//   addTask: async (taskName) => {
//     try {
//       const response = await axiosInstance.post("/tasks", { task_name: taskName });
//       return response.data; // Return the newly created task
//     } catch (error) {
//       console.error("Error adding task:", error);
//       throw error;
//     }
//   },

//   // Mark Task as Done
//   markTaskAsDone: async (taskId) => {
//     try {
//       const response = await axiosInstance.put(`/tasks/${taskId}`);
//       return response.data; // Return the updated task data
//     } catch (error) {
//       console.error("Error marking task as done:", error);
//       throw error;
//     }
//   },

//   // Delete Task
//   deleteTask: async (taskId) => {
//     try {
//       const response = await axiosInstance.delete(`/tasks/${taskId}`);
//       return response.data; // Return the delete confirmation
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       throw error;
//     }
//   },


// };
