import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./Weeklyplanner.css";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { FaMinus, FaCheck } from "react-icons/fa";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// const API_URL = "http://localhost:5000";
const API_URL = "to-do-list-production-a8c8.up.railway.app";

export default function WeeklyPlanner() {
  const [planner, setPlanner] = useState({});
  const [newTask, setNewTask] = useState({ day: "Monday", time: "", title: "" });
  const [weekOffset, setWeekOffset] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const navigate = useNavigate();

  const logWithTime = (msg) => {
    const now = new Date().toLocaleString("en-GB", {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log(`⏱️ [${now}] ${msg}`);
  };

  const getWeekDates = (offset = 0) => {
    const today = dayjs();
    const distance = today.day() === 0 ? -6 : 1 - today.day();
    const startOfWeek = today.add(distance + offset * 7, 'day');
    return daysOfWeek.map((_, i) => startOfWeek.add(i, 'day').format("YYYY-MM-DD"));
  };

  const weekDates = getWeekDates(weekOffset);
  const todayDate = dayjs().format("YYYY-MM-DD");

  const fetchTasks = async () => {
    try {
      logWithTime("Fetching tasks from API...");

      const token = localStorage.getItem("authToken");
      console.log("token is :", token)
      const res = await axios.get(`${API_URL}/weeklyplanner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched planner data:", res.data);

      const grouped = {};
      res.data.forEach(task => {
        let effectiveDate = dayjs(task.task_date);
        if (task.repeatWeekly) {
          const taskDayIndex = daysOfWeek.indexOf(task.day);
          effectiveDate = dayjs(weekDates[taskDayIndex]);
        }
        const formattedDate = effectiveDate.format("YYYY-MM-DD");

        if (!grouped[formattedDate]) grouped[formattedDate] = [];
        grouped[formattedDate].push({
          title: task.title,
          time: task.time,
          done: formattedDate === todayDate ? task.done || false : false,
          id: task.id,
          day: task.day
        });
      });

      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => a.time.localeCompare(b.time));
      });

      setPlanner(grouped);
    } catch (err) {
      logWithTime("❌ Error fetching tasks");
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    logWithTime("Component mounted or weekOffset changed");
    fetchTasks();
  }, [weekOffset]);

  const weekaddTask = async () => {
    if (!newTask.title || !newTask.time) return;
    logWithTime(`Adding task: ${newTask.title} at ${newTask.time}`);

    const selectedDate = weekDates[daysOfWeek.indexOf(newTask.day)];
    const token = localStorage.getItem("authToken");

    try {
      const res = await axios.post(`${API_URL}/weeklyplanner`, {
        title: newTask.title,
        day: newTask.day,
        time: newTask.time,
        repeatWeekly: true,
        task_date: selectedDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const added = res.data;

      setPlanner(prev => {
        const tasks = prev[selectedDate] || [];
        return {
          ...prev,
          [selectedDate]: [...tasks, { ...newTask, done: false, id: added.id, day: newTask.day }]
        };
      });

      setNewTask({ day: "Monday", time: "", title: "" });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const weektoggleTaskDone = async (date, index, taskId) => {
    logWithTime(`Toggling task ID ${taskId} for date ${date}`);

    if (date !== todayDate) {
      alert("You can only mark tasks as done for today's date!");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      await axios.put(`${API_URL}/weeklyplanner/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlanner(prev => {
        const updatedTasks = [...prev[date]];
        updatedTasks[index] = {
          ...updatedTasks[index],
          done: !updatedTasks[index].done
        };
        return { ...prev, [date]: updatedTasks };
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (date, taskId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${API_URL}/weeklyplanner/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanner(prev => {
        const updatedTasks = prev[date].filter(task => task.id !== taskId);
        return { ...prev, [date]: updatedTasks };
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="week-container">
      <div className="week-navigation">
        <button title="previous week" onClick={() => setWeekOffset(prev => prev - 1)}>&lt;</button>
        <button title="next week" onClick={() => setWeekOffset(prev => prev + 1)}>&gt;</button>
      
      </div>

      <div className="week-scroll">
        {weekDates.map((date, i) => {
          const tasks = planner[date] || [];
          const completed = tasks.filter(t => t.done).length;
          const total = tasks.length;
          return (
            <div key={date} className={`week-day-container ${date === todayDate ? "week-today" : ""}`}>
              <div className="week-day-header">
                <span className="week-day-name">{daysOfWeek[i]}</span>
                <span className="week-date">{date}</span>
                <span className="task-progress">{completed}/{total} tasks done</span>
              </div>
              <div className="week-tasks">
              <ul className={`week-ul ${deleteMode ? "delete-mode" : ""}`}>
              {tasks.map((task, index) => (
                    <li className="week-li" key={task.id || index}>
                      {deleteMode ? (
                        <button
                          className="delete-button"
                          onClick={() => deleteTask(date, task.id)}
                          title="Delete task"
                        >
                          <FaMinus />
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => weektoggleTaskDone(date, index, task.id)}
                          disabled={date !== todayDate}
                        />
                      )}
                      <span className={task.done ? "line-through" : ""}>
                        {task.time.slice(0, 5)} - {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-button-group">
        <div className="week-selection">
          <div className="week-select-container">
            <select
              className="week-select"
              value={newTask.day}
              onChange={e => setNewTask({ ...newTask, day: e.target.value })}
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={newTask.time}
              onChange={e => setNewTask({ ...newTask, time: e.target.value })}
              className="week-select-time"
            />
            <input
              type="text"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task description"
              className="week-select-text week-input"
            />
                  <div>
              <button data-tooltip-id="back-tooltip" className="week-back-button" onClick={() => navigate("/Tasklist")}> <FaArrowLeft /> </button>
              <Tooltip id="back-tooltip" place="top" content="home page" delayShow={0} />
            </div>
            <button onClick={weekaddTask} className="week-button">Add</button>
      
            <div className="week-range">{weekDates[0]} → {weekDates[6]}</div>
            <button title="Select task" className="week-button select-title" onClick={() => setDeleteMode(prev => !prev)}>
          {deleteMode ? "Done" : "Select"}
        </button>
          </div>
        </div>
      </div>
    </div>
  );
}
