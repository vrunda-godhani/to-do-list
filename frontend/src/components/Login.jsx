import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Login.css';
import LoginAuth from "./LoginAuth"; // Import GoogleAuth component

const API_URL = "http://localhost:5000"; // Ensure this matches your backend

const Login = ({ onLoginSuccess, togglePage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        onLoginSuccess(response.data.token);
        toast.success("Login successful!");
      } else {
        throw new Error("Token not received.");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-pos">
      <div className="box">
        <form onSubmit={handleLogin}>
          <h2 className="lr-title">Login</h2>
          <div className="input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-text"><FaLock /></span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="lr-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* 🔹 Google Login */}
        <LoginAuth
          onSuccess={(backendToken) => { // ✅ Receive backend token from GoogleAuth
            console.log("Google Login Successful:", backendToken);

            if (backendToken) {
              localStorage.setItem("authToken", backendToken); // ✅ Store backend JWT
              onLoginSuccess(backendToken); // ✅ Call login success handler
            }
          }}
        />
        {/* <GoogleAuth
  onLogin={async (googleToken) => {
    try {
      const res = await axios.post(`${API_URL}/google-login`, { token: googleToken });
      if (res.data.success) {
        localStorage.setItem("authToken", res.data.token);
        // handle login success
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }}
/> */}



        <button onClick={togglePage} className="toggle-btn">
          Don't have an account? Register here
        </button>
      </div>
    </div>
  );
};

export default Login;
