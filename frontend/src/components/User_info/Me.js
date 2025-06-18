// when you click on the icon it should to display whole thind about task and add tiny button for the edit

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { VscGraph } from "react-icons/vsc";
import { BsJournalText } from "react-icons/bs";
// import Lottie from "react-lottie";
// import animationData from "../../components/animation.json"; // Lottie Animation
import Menu from "../Menu";
import "./Me.css";
import Logo from './logo';
import "../../photo/icon.png";

// const API_URL = "http://localhost:5000";
const API_URL = "https://to-do-list-production-7667.up.railway.app";

export default function Me({ handleLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [avatar, setAvatar] = useState(localStorage.getItem("userAvatar") || user?.picture || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      fetchTasks(token);
    }
  }, []);

  const fetchTasks = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleLogoutAndRedirect = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    handleLogout();
    navigate("/");
  };

  const handleLoginSuccess = async (response) => {
    try {
      const res = await axios.post(`${API_URL}/google-login`, { token: response.credential });
      localStorage.setItem("authToken", res.data.token);
      const decodedUser = jwtDecode(res.data.token);
      setUser(decodedUser);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_done).length;
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const data = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
  ];

  const COLORS = ["#3498db", "#e74c3c"];

  // Lottie Animation Options
  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData: animationData,
  // };

  // const handleAvatarChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     setAvatar(imageUrl);
  //     localStorage.setItem("userAvatar", imageUrl);
  //     setIsEditing(false);
  //   }
  // };
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(`${API_URL}/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      const { imageUrl } = res.data;
      setAvatar(imageUrl);
      localStorage.setItem("userAvatar", imageUrl);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to upload avatar", err);
    }
  };
  

  const handleDeletePicture = () => {
    setAvatar("default-avatar.png"); // Reset to default image
    localStorage.removeItem("userAvatar");
    setIsEditing(false);
  };



  return (
    <div className="me-back">

      {user ? (
        <div className="user-info">
          <div className="avatar-section" onClick={() => setShowPopup(true)}>
            <Logo user={user} />
          </div>


          {/* User Popup */}
          {showPopup && (
            <div className="me-popup" >
              <div className="me-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="avatar-bg">
                  <div className="avatar-container" style={{ position: 'relative', display: 'inline-block', marginTop: "6px" }}>

                    <Avatar alt={user?.name || "User"} src={avatar || user?.picture || "null"}>
                      {!user?.picture && (user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : user?.email
                          ? user.email.charAt(0).toUpperCase()
                          : "U")}
                    </Avatar>



                    {/* Pencil icon appears as a badge over the profile */}
                    {true && (
                      <div className="edit-icon-btn" onClick={() => setIsEditing(!isEditing)}>
                        ✏️
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="edit-options">
                      <button className="option-btn" onClick={() => document.getElementById("fileInput").click()}>
                        Add Photo
                      </button>
                      <button className="option-btn delete-btn" onClick={handleDeletePicture}>
                        Delete Picture
                      </button>
                      <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="avatar-upload"
                        style={{ display: "none" }}
                      />
                    </div>
                  )}
                  <div className="user-info-text text-p2">
                    <p style={{ marginBottom: "3px", fontSize: "16px" }}>
                      {"  "}
                      {user?.name && user.name.trim() !== ""
                        ? user.name // if name is provided (e.g., from Google)
                        : user?.email?.split("@")[0]} {/* fallback: use part before @ */}
                    </p>
                    {/* <p style={{ marginBottom: "3px", fontSize: "16px" }}>
  {user?.name && user.name.trim() !== "" ? user.name : ""}
</p> */}

                    <p style={{ marginBottom: "3px", fontSize: "14px", fontWeight: "400" }}> {user?.email}</p>
                  </div>
                </div>

                {/* Task Buttons moved inside popup */}
                <button className="me-task-btn" onClick={() => setShowStats(!showStats)}>Task Statistics</button>
                {showStats && (
                  <div className="user-stats">
                    <button className="graph-text-button" onClick={() => setShowGraph(!showGraph)} style={{ cursor: "pointer", fontWeight: "bold" }}>
                      {showGraph ? <BsJournalText /> : <VscGraph />}
                    </button>

                    {showGraph ? (
                      <div style={{ width: "100%", height: 250 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="task-stats-row">
                        <div className="task-count-item">
                          <p className="task-count">{totalTasks}</p>
                          <p className="task-label">Total Tasks</p>
                        </div>
                        <div className="task-count-item">
                          <p className="task-count">{completedTasks}</p>
                          <p className="task-label">Completed Tasks</p>
                        </div>
                        <div className="task-count-item">
                          <p className="task-count">{pendingTasks}</p>
                          <p className="task-label">Pending Tasks</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button className="task-completion" onClick={() => setShowProgress(prev => !prev)}> Task Completion </button>
                {showProgress && (
                  <div className="progress-section">
                    <LinearProgress variant="determinate" value={progress} />
                    <p>{Math.round(progress)}% Completed</p>
                  </div>
                )}

                <Link to="/Tskhistory">
                  <button className="me-task-hist">Task History</button>
                </Link>
                <div className="button-row">
                  <button className="me-logout" onClick={handleLogoutAndRedirect}>Logout</button>
                  <button className="close-btn" onClick={() => setShowPopup(false)}>Close</button>
                </div>

              </div>
            </div>
          )}
        </div>
      ) : (
        <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />
      )}

      <Menu handleLogout={handleLogoutAndRedirect} />
    </div>
  );
}
