import React, { useState, useEffect } from "react";
import './Tasklist.css';
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdFileDownloadDone } from "react-icons/md";
import Menu from "./Menu";
import { toast } from "react-toastify";
import Calendar from "./tileCalendar.js";
import "../App.css"
import Me from "./User_info/Me.js"
import { getCurrentMonthFestivals } from "./tileCalendar";


const TaskList = ({ selectedDate, tasks, filteredTasks, onAddTask, onDeleteTask, setSelectedDate, onToggleTaskDone, onUpdateTask, fetchTasks, handleLogout }) => {
    const [editingTask, setEditingTask] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [taskPriority, setTaskPriority] = useState("normal");
    const [currentTask, setCurrentTask] = useState(null);
    const [taskText, setTaskText] = useState("");
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [allFestivals, setAllFestivals] = useState([]);

    const today = new Date();
    const defaultDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const defaultTime = today.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

    const [newTask, setNewTask] = useState({
        text: "",
        date: defaultDate,
        time: defaultTime,
        priority: "normal",
    });


    // Ensure date and time are set when the popup opens
    useEffect(() => {
        if (showAddPopup) {
            setNewTask((prevTask) => ({
                ...prevTask,
                date: prevTask.date || defaultDate,
                time: prevTask.time || defaultTime,
            }));
        }
    }, [showAddPopup]);




    useEffect(() => {
        scheduleReminders(tasks);
        registerServiceWorker();
    }, [tasks]);

    const handleAddTask = () => {
        if (newTask.text.trim() !== "") {
            const selectedDateTime = new Date(`${newTask.date}T${newTask.time}`);

            const taskData = {
                task_text: newTask.text,
                priority: newTask.priority || "normal",
                task_date: selectedDateTime.toISOString(),
            };

            // Call the parent function to update the task list
            onAddTask(taskData);

            // Reset task input fields after adding a task
            setNewTask({
                text: "",
                date: defaultDate,
                time: defaultTime,
                priority: "normal",
            });

            setShowAddPopup(false);
        } else {
            toast.warn("Please enter a task.");
        }
    };


    const handleToggleTaskDone = async (taskId) => {
        try {
            await onToggleTaskDone(taskId);  // ✅ Use toggleTaskDone directly
        } catch (error) {
            console.error("Error marking task as done:", error);
        }
    };


    const scheduleReminders = (tasks) => {
        if (!('Notification' in window)) {
            console.error('This browser does not support desktop notifications.');
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') return;

            tasks.forEach(task => {
                const taskTime = new Date(task.task_date).getTime();
                const now = Date.now();

                const reminders = [
                    { time: taskTime - 24 * 60 * 60 * 1000, message: `Reminder: '${task.task_text}' is due in 1 day!` },
                    { time: taskTime - 12 * 60 * 60 * 1000, message: `Reminder: '${task.task_text}' is due in 12 hours!` },
                    { time: taskTime - 6 * 60 * 60 * 1000, message: `Reminder: '${task.task_text}' is due in 6 hours!` },
                ];

                reminders.forEach(({ time, message }) => {
                    const delay = time - now;
                    if (delay > 0) {
                        setTimeout(() => {
                            if (Notification.permission === 'granted') {
                                new Notification(message);
                            } else {
                                toast.info(message);
                            }
                        }, delay);
                    }
                });
            });
        });
    };

    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    };



    const handleOpenPopup = (task) => {
        setShowPopup(true);
        setCurrentTask(task);
        setTaskText(task.task_text);

        const taskDate = new Date(task.task_date);
        const task_date = taskDate.toISOString().split("T")[0];
        const task_time = taskDate.toTimeString().slice(0, 5); // HH:MM format

        console.log("📆 Parsed Task Date:", task_date);
        console.log("⏰ Parsed Task Time:", task_time);
        setEditingTask({ task_date, task_time });
        setTaskPriority(task.priority || "normal");
    };


    const handleClosePopup = () => {
        setShowPopup(false);
        setCurrentTask(null);
        setTaskText("");
        setTaskPriority("normal");
    };



    const updateTask = async () => {
        if (!currentTask || !editingTask.task_date || !editingTask.task_time) {
            toast.warn("Please enter a valid date and time.");
            return;
        }

        try {
            // Ensure proper zero-padding for hours and minutes if needed
            const time = editingTask.task_time.length === 5 ? editingTask.task_time : "00:00";

            // Combine the updated date and time into a valid ISO string
            const updatedDateTime = `${editingTask.task_date}T${time}:00`;

            const updatedTask = {
                id: currentTask.id,
                task_text: taskText.trim() || currentTask.task_text,
                task_date: updatedDateTime,
                priority: taskPriority,
            };

            console.log("✅ Updating Task:", updatedTask);

            await onUpdateTask(updatedTask); // Call parent update
            toast.success("Task updated successfully!");

            await fetchTasks(new Date(updatedDateTime)); // Ensure fetch uses a valid Date object

            setEditingTask(null);
            handleClosePopup();
        } catch (error) {
            console.error("🔥 Error updating task:", error);
            toast.error("Failed to update task.");
        }
    };
    const showMonthCelebrations = () => {
        const monthFestivals = getCurrentMonthFestivals(allFestivals);
        setSelectedFestival({ name: "MONTH_LIST", festivals: monthFestivals });

    };


    return (
        <div className="tasklist">
            <div className="task-space">

                <h1>To-Do List</h1>
                <div className="cal-box">
                    <Calendar
                        onDateChange={setSelectedDate}
                        tasks={tasks}
                        onFestivalSelect={setSelectedFestival}
                        setAllFestivals={setAllFestivals}
                    />

                </div>


                <h2>Tasks for {selectedDate.toDateString()}</h2>
                <Me tasks={tasks} handleLogout={handleLogout} />
                <Menu
                    handleLogout={handleLogout}
                    selectedFestival={selectedFestival}
                    showMonthCelebrations={showMonthCelebrations}
                    setSelectedFestival={setSelectedFestival}
                    allFestivals={allFestivals}
                />

                <button className="tsk-btn" onClick={() => setShowAddPopup(true)}>Add Task</button>

                {filteredTasks.length > 0 ? (
                    <ul className="task-box">
                        {filteredTasks.map((task, index) => (

                            <li key={index} className={`task-item ${task.priority}`} onClick={() => handleOpenPopup(task)}>

                                <span className={`toggle-task ${task.is_done ? "task-done" : ""}`}>
                                    ➤ {task.task_text}
                                    {/* ➤ {task.task_text} ({task.priority}, {new Date(task.task_date).toLocaleDateString()} at {new Date(task.task_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) */}

                                </span>
                                <div className="button-container">
                                    <button
                                        className="check-btn"
                                        onClick={(event) => {
                                            event.stopPropagation(); // Prevents triggering parent click event
                                            handleToggleTaskDone(task.id);
                                        }}
                                    >
                                        <MdFileDownloadDone />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tasks for this date.</p>
                )}

                <div>

                    {showAddPopup && (
                        <div className="popup">
                            <div className="popup-content">
                                <h3>Add Task</h3>
                                <input type="text" placeholder="Task" value={newTask.text} onChange={(e) => setNewTask({ ...newTask, text: e.target.value })} />
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



                                <button className="tsk-btn" onClick={() => { setShowAddPopup(true); handleAddTask(); }}>Add</button>
                                <button onClick={() => setShowAddPopup(false)}>Cancel</button>
                                <div className="dropdown-container">

                                    <select className="dropdown-select"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="normal">Normal</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPopup && (
                        <div className="popup">
                            <div className="popup-content">
                                <h3>Edit Task</h3>
                                <input
                                    type="text"
                                    value={taskText}
                                    onChange={(e) => setTaskText(e.target.value)}
                                    placeholder="Edit Task"
                                />
                                {/* <input
                                    type="date"
                                    value={selectedTaskDate}
                                    onChange={(e) => setSelectedTaskDate(e.target.value)}
                                /> */}

                                {/* <input
                                    type="time"
                                    value={selectedTaskTime}
                                    onChange={(e) => setSelectedTaskTime(e.target.value)}
                                /> */}
                                <input
                                    type="date"
                                    value={editingTask?.task_date || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, task_date: e.target.value })}
                                />

                                <input
                                    type="time"
                                    value={editingTask?.task_time || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, task_time: e.target.value })}
                                />

                                <button onClick={updateTask}>Update</button>
                                <button onClick={handleClosePopup}>Cancel</button>
                                <button onClick={() => { onDeleteTask(currentTask.id); handleClosePopup(); }}>Delete</button>

                                <div className="dropdown-container">
                                    <select
                                        className="dropdown-select"
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="normal">Normal</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* test notification is work or not */}
                    {/* <button
                        className="tsk-btn"
                        onClick={() => {
                            if (Notification.permission === 'granted') {
                                new Notification('✅ Test Notification: It works!');
                            } else {
                                Notification.requestPermission().then(permission => {
                                    if (permission === 'granted') {
                                        new Notification('✅ Test Notification: It works!');
                                    } else {
                                        alert('Notifications are blocked.');
                                    }
                                });
                            }
                        }} >
                        Test Notification
                    </button> */}

                </div>
            </div>
        </div>
    );
};

export default TaskList;
