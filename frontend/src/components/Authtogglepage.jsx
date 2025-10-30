import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuth from "./GoogleAuth"; // Import the new GoogleAuth component

const CLIENT_ID = "257603738713-47g5ttbbqb5ivamea6aml3mqiqp0pkrf.apps.googleusercontent.com";

const AuthTogglePage = ({ onLoginSuccess, onRegisterSuccess }) => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    localStorage.setItem("authToken", token);
    onLoginSuccess(token);
    navigate("/tasklist");
  };

  const handleRegisterSuccess = (token) => {
    localStorage.setItem("authToken", token);
    onRegisterSuccess(token);
    navigate("/tasklist");
  };

  const togglePage = () => {
    setIsLoginPage(!isLoginPage);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="auth-page">

        {/* Login or Register Component */}
        {isLoginPage ? (
          <Login onLoginSuccess={handleLoginSuccess} togglePage={togglePage} />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} togglePage={togglePage} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthTogglePage;
