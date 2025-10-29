import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const LoginAuth = ({ onSuccess }) => {
  const handleSuccess = async (response) => {
    const googleToken = response.credential; // ✅ Google token
    console.log("Google Login Success:", googleToken);

    try {
      // ✅ Send Google token to backend for verification
      const res = await axios.post("import.meta.env.VITE_API_URL/google-login", { token: googleToken });
      // const res = await axios.post("https://to-do-list-production-7667.up.railway.app/google-login", { token: googleToken });
      // const res = await axios.post("https://to-do-list-production-7667.up.railway.app/google-login", { token: googleToken });
      


      if (res.data.success) {
        console.log("Backend Verification Success:", res.data);

        // ✅ Store the backend JWT (not Google's token)
        localStorage.setItem("authToken", res.data.token);

        // ✅ Pass backend JWT to parent (Login/Register)
        onSuccess(res.data.token);
      } else {
        console.error("Backend Verification Failed:", res.data);
      }
    } catch (error) {
      console.error("Error verifying token with backend:", error);
    }
  };

  return (
    // <GoogleLogin
    //   onSuccess={handleSuccess}
    //   onError={() => console.log("Google Login Failed")}
    // />
    <GoogleLogin
  onSuccess={handleSuccess}
  onError={() => console.log("Login Failed")}
  useOneTap={false}
  theme="outline"
  text="signin_with"
  shape="rectangular"
/>

  );
};

export default LoginAuth;
