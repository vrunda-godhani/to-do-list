import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuth = ({ onLogin, onVerify }) => {
  const handleSuccess = (response) => {
    const googleToken = response.credential; // This is the raw Google ID token
    console.log("GoogleAuth success:", googleToken);

    // Decide what to do with the token:
    if (onVerify) {
      // Used for email verification during manual registration
      onVerify(googleToken);
    } else if (onLogin) {
      // Used for full login
      onLogin(googleToken);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Google Login Failed")}
    />
  );
};

export default GoogleAuth;
