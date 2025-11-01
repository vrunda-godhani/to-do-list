import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";  // ✅ Import GoogleOAuthProvider

import TaskList from "./components/Tasklist.js";
import Theme from "./components/Theme.jsx";
import Login from "./components/Login.jsx";
import Notes from "./components/Notes.jsx";
import Menu from "./components/Menu.jsx";
import Gmap from "./components/Gmap.jsx";
import Me from "./components/User_info/Me.js";
import Tskhistory from "./components/User_info/Tskhistory"; // ✅ Import Task History
import Weather from "./components/Weather.jsx";
import Register from "./components/Register.jsx"; // Register Component
import AuthTogglePage from "./components/Authtogglepage.jsx"; // Register Component
import WeeklyPlanner from "./components/WeeklyPlanner.js"
// import ForgotPin from "./components/ForgotPin.jsx";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";


// import GoogleAuth from "./components/GoogleAuth.js"

// const API_URL = "http://localhost:5000"; //your backend URL
const API_URL = process.env.REACT_APP_API_URL || "https://todo-backend-257603738713.asia-south1.run.app";
console.log("backend api",API_URL);
const CLIENT_ID = "257603738713-47g5ttbbqb5ivamea6aml3mqiqp0pkrf.apps.googleusercontent.com"; // ✅ Add your Google Client ID

const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("authToken");
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Selected Date Changed:", selectedDate);
      console.log("Fetching tasks after authentication or date change...");
      fetchTasks(selectedDate);

    }
  }, [selectedDate, isAuthenticated]); //  Ensure `isAuthenticated` is required before fetching
  const formatToLocalISOString = (date) => {
    // Simply get YYYY-MM-DDTHH:MM of your local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    console.log("Formatted Date without timezone shift:", formatted);
    return formatted;
  };
  

const token = localStorage.getItem("authToken");
console.log("Auth Token from localStorage:", token);

  const addTask = async ({ task_text, task_date, priority }) => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
  
        // Convert the task_date to local time in "YYYY-MM-DDTHH:MM" format
        const selectedDate = formatToLocalISOString(new Date(task_date));
  
        await axios.post(
            `${API_URL}/tasks`,
            { 
                task_text, 
                task_date: selectedDate, // Store it in the correct format
                priority 
            },
{ headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("Adding task:",selectedDate );
        toast.success("Task added successfully!");
        fetchTasks(selectedDate); // Ensure consistency
    } catch (error) {
        console.error("Error adding task:", error.response?.data || error.message);
        toast.error("Failed to add task.");
    }
  };

  
const fetchTasks = async (date) => {
  try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Ensure `date` is in "YYYY-MM-DDTHH:MM" format
      const formattedDate = formatToLocalISOString(new Date(date));

      console.log("Fetching tasks for date:", formattedDate);

      const response = await axios.get(`${API_URL}/tasks?datetime=${formattedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched tasks:", response.data);

      setTasks(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
      toast.error("Failed to fetch tasks.");
  }
};



  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchTasks(selectedDate);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("User is not authenticated.");
        return;
      }

      await axios.put(
        `${API_URL}/tasks/${updatedTask.id}`,
        {
          task_text: updatedTask.task_text,
          task_date: updatedTask.task_date,
          priority: updatedTask.priority  // ✅ Send priority update
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("update task:", updatedTask.task_date)

      toast.success("Task updated successfully!");
      // await fetchTasks(new Date(updatedTask.task_date)); // Pass it explicitly
      await fetchTasks(
        isNaN(new Date(updatedTask.task_date).getTime()) 
          ? selectedDate 
          : updatedTask.task_date
      );
    } catch (error) {
      console.error("Error updating task:", error.response?.data || error.message);
      toast.error("Failed to update task.");
    }
  };



  const toggleTaskDone = async (taskId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.put(
        `${API_URL}/tasks/${taskId}/done`,  // ✅ Corrected API endpoint
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTasks(selectedDate); // Use current date if selectedDate is invalid
    } catch (error) {
      console.error("Error marking task as done:", error);
      toast.error("Failed to mark task as done.");
    }
  };



  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchTasks(selectedDate);
  };
  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    fetchTasks(selectedDate);
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    toast.success("You have been logged out successfully!");
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>  {/* ✅ Wrap everything */}

      <Router>
        <div className="App">
          <ToastContainer />
          <Routes>
            {/* Auth Page (Login/Register toggle) */}
            {/* <Route path="/" element={<AuthPage />} /> */}
            <Route path="/" element={<AuthTogglePage onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} />} />

            {/* Login Page */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/tasklist" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            {/* Register Page */}
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/tasklist" replace />
                ) : (
                  <Register onRegisterSuccess={handleRegisterSuccess} />
                )
              }
            />


            {/* Task List Page */}
            <Route
              path="/tasklist"
              element={
                <PrivateRoute element={
                  <>
                 
                 <TaskList
  selectedDate={selectedDate}
  tasks={tasks} // Pass full list for calendar
  filteredTasks={tasks.filter(task => {
    const taskDate = new Date(task.task_date);
    taskDate.setHours(12, 0, 0, 0);
    const formattedTaskDate = taskDate.toISOString().split("T")[0];

    const selectedTaskDate = new Date(selectedDate);
    selectedTaskDate.setHours(12, 0, 0, 0);
    const formattedSelectedDate = selectedTaskDate.toISOString().split("T")[0];

    return formattedTaskDate === formattedSelectedDate;
  })}
  

                      onAddTask={addTask}
                      onDeleteTask={deleteTask}
                      onToggleTaskDone={toggleTaskDone}
                      handleLogout={handleLogout}
                      fetchTasks={fetchTasks}
                      onUpdateTask={updateTask}
                      setSelectedDate={setSelectedDate}
                    />
                  </>
                } />
              }
            />

            {/* Theme Page */}
            <Route path="/Theme" element={<PrivateRoute element={<Theme tasks={tasks} addTask={addTask} />} />} />
            <Route path="/notes" element={<Notes handleLogout={handleLogout} />} />
            <Route path="/Me" element={<Me handleLogout={handleLogout} />} />
            <Route path="/Weather" element={<Weather handleLogout={handleLogout} />} />
            <Route path="/Gmap" element={<Gmap handleLogout={handleLogout} />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/Tskhistory" element={<Tskhistory />} /> {/* ✅ Add Route */}
            <Route path="/WeeklyPlanner" element={<WeeklyPlanner />} /> 
            {/* <Route path="/forgot-pin" element={<ForgotPin />} /> */}

            {/* Catch-All Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>

  );
}


export default App;
