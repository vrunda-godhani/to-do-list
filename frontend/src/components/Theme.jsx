
// try to call toggletask from app.js


  import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import { toast } from "react-toastify";
import "./Theme.css";
import Menu from "./Menu";
import axios from "axios"
// const API_URL = "http://localhost:5000"; //your backend URL

const API_URL = import.meta.env.VITE_API_URL;

const Theme = ({ tasks, addTask }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [texttasks, setTasks] = useState([]);

    const today = new Date();
    const defaultDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const defaultTime = today.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

    const [newTask, setNewTask] = useState({
        text: "",
        date: defaultDate,
        time: defaultTime,
        priority: "normal",
    });
    // useEffect(() => {
    //     fetchTasks();
    //   }, []);
    // Handle date click - Open popup
    const handleDateClick = (info) => {
        const clickedDate = new Date(info.date);
        
        // Format date as YYYY-MM-DD
        const formattedDate = clickedDate.toISOString().split("T")[0];
    
        // Format time as HH:MM
        const hours = clickedDate.getHours().toString().padStart(2, "0");
        const minutes = clickedDate.getMinutes().toString().padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;
    
        setSelectedDate(clickedDate);
        setNewTask({ ...newTask, date: formattedDate, time: formattedTime });
        setShowPopup(true);
    };
     

    // Handle task submission from popup
    const handleAddTask = () => {
        if (newTask.text.trim() !== "") {
            const selectedDateTime = new Date(`${newTask.date}T${newTask.time}`);

            const taskData = {
                task_text: newTask.text,
                priority: newTask.priority || "normal",
                task_date: new Date(selectedDate).toISOString(),
              };

            // Call the parent function to update the task list
            addTask(taskData);

            // Reset task input fields after adding a task
            setNewTask({
                text: "",
                date: defaultDate,
                time: defaultTime,
                priority: "normal",
            });

            setShowPopup(false); // Close popup
        } else {
            toast.warn("Task title cannot be empty.");
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        // setCurrentTask(null);
        // setTaskText("");
        // setTaskPriority("normal");
    };
    const toggleTaskCompletion = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1; // Toggle between 1 (done) and 0 (not done)
        try {
            await axios.put(`${API_URL}/tasks/${taskId}`, { done: newStatus });
    
            // Update tasks state properly
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, done: newStatus } : task
                )
            );
        } 
        catch (error) {
            console.error('Error updating task:', error);
            toast.error("Failed to update task status.");
        }
    };
    
    

    return (
        <div className="back-cal">
            <Menu />
            
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={tasks.map((task) => ({
                        title: `${task.task_text}`,
                        start: new Date(task.task_date),
                        color:
                            task.priority === "high"
                                ? "#ff4d4f"
                                : task.priority === "medium"
                                ? "#faad14"
                                : "#52c41a",
                    }))}
                    dateClick={handleDateClick}
                    dayCellDidMount={(info) => {
                        info.el.style.color = "black"; // Change date cell text color
                    }}

                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}

                    editable={true}
                    selectable={true}
                    slotDuration="00:30:00"

                />
            </div>



            {/* Task Popup */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Add Task</h3>
                        <input
                            type="text"
                            placeholder="Task"
                            value={newTask.text}
                            onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                        />
                        <input
                            type="date"
                            value={newTask.date}
                            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                        />
                        <input
                            type="time"
                            value={newTask.time}
                            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                        />

                        <div className="dropdown-container">
                            <select
                                className="dropdown-select"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="normal">Normal</option>
                            </select>
                        </div>

                        <button className="theme-tsk-btn" onClick={handleAddTask}>Add</button>
                        <button onClick={handleClosePopup}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Theme;
