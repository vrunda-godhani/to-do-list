import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import GoogleAuth from "./GoogleAuth"; // Import GoogleAuth component
import {  FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "http://localhost:5000"; // Ensure this matches your backend
// const API_URL = "https://to-do-list-production-7667.up.railway.app";

const Register = ({ onRegisterSuccess, togglePage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, { email, password });

      if (response.status === 201) {
        const token = response.data.token;

        if (token) {
          localStorage.setItem("authToken", token);
          toast.success("Registration successful!");

          if (onRegisterSuccess) {
            onRegisterSuccess(token);
          }
        } else {
          toast.error("No token received!");
        }
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box">
      <form onSubmit={handleRegister}>
        <h2 className="lr-title">Register</h2>

        <div className="input-group">
          <span className="input-group-text"><FaEnvelope /></span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsEmailVerified(false); // reset on email change
            }}
            className="form-control"
            required
          />
        </div>

        <div className="input-group">
          <span className="input-group-text"><FaLock /></span>
         
          <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setIsEmailVerified(false); // reset on password change
            }}
            className="form-control"
            required
          />
            <span
              className="input-group-text"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>

        {isEmailVerified && (
          <div className="alert alert-success mt-2" role="alert">
            Email verified ✅ You can now register.
          </div>
        )}

        {email && password && !isEmailVerified && (
          <div className="mt-3">
            <p className="text-muted">Verify your email via Google before registering:</p>
           <div className="google-login">
            <GoogleAuth 
  onVerify={async (googleToken) => {
    try {
      const response = await axios.post(`${API_URL}/register/verify-email`, {
        token: googleToken,
        email,
      });
      if (response.status === 200) {
        setIsEmailVerified(true);
        toast.success("✅ Email verified successfully!");
      }
    } catch (err) {
      console.error("Verification Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "❌ Verification failed.");
    }
  }}
/> 
</div>
          </div>
        )}

        <button
          type="submit"
          className="lr-btn"
          disabled={loading || !email || !password || !isEmailVerified}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      

      <button onClick={togglePage} className="toggle-btn">
        Already have an account? Login here
      </button>
    </div>
  );
};

export default Register;
