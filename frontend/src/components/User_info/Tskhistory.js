import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Tskhistory.css";
import { MdOutlinePendingActions } from "react-icons/md";
import { IoMdDoneAll } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";



// const API_URL = "http://localhost:5000"; // Update with your backend URL
const API_URL = import.meta.env.VITE_API_URL;

const Tskhistory = () => {
  const [tasks, setTasks] = useState([]);
  const [filterOption, setFilterOption] = useState("latest");
  const navigate = useNavigate(); // ✅ Hook for navigation

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Sorting and filtering logic
  const sortedTasks = [...tasks].sort((a, b) => {
    if (filterOption === "ascending") {
      return new Date(a.task_date) - new Date(b.task_date);
    } else if (filterOption === "descending") {
      return new Date(b.task_date) - new Date(a.task_date);
    } else if (filterOption === "latest") {
      return new Date(b.task_date) - new Date(a.task_date);
    }
    return 0;
  });

  const filteredTasks =
  filterOption === "pending"
    ? sortedTasks.filter((task) => task.is_done === 0) // ✅ Show only pending tasks
    : filterOption === "complete"
    ? sortedTasks.filter((task) => task.is_done === 1) // ✅ Show only completed tasks
    : sortedTasks; // Show all tasks by default


  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const taskDate = new Date(task.task_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (!acc[taskDate]) {
      acc[taskDate] = [];
    }
    acc[taskDate].push(task);
    return acc;
  }, {});

  return (
<div className="bck-his">


    <div className="task-history-container">
  <div className="task-history-header">
    {/* Back Button on Left */}
    <button className="back-button" onClick={() => navigate("/tasklist")}>
      <FaArrowLeft />
    </button>

    {/* Title in Center */}
    <h2>Task History</h2>

    {/* Dropdown on Right */}
    <div className="dropdown-container">
      <select
        className="dropdown-select"
        value={filterOption}
        onChange={(e) => setFilterOption(e.target.value)}
      >
        <option value="latest">Latest</option>
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option>
        <option value="pending">Pending</option>
        <option value="complete">Complete</option>
      </select>
    </div>
  </div>


      <div className="task-history-list">
        {Object.keys(groupedTasks).length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          Object.entries(groupedTasks).map(([date, tasks]) => (
            <div key={date} className="task-day">
              <h3>{date}</h3>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id} className={`tsk-item ${task.priority}`}>
                    <div className="task-info">
                      <p className="task-time">
                        {new Date(task.task_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                      <p className="task-text">{task.task_text}</p>
                      <p className={`task-status ${task.is_done ? "completed" : "pending"}`}>
                        {task.is_done ? <IoMdDoneAll />: <MdOutlinePendingActions />}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
    </div>

  );
};

export default Tskhistory;
