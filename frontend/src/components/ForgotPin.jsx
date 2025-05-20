// import React, { useState } from "react";
// import axios from "axios";

// const ForgotPin = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("/api/auth/forgot-pin", { email });
//       setMessage(res.data.message);
//     } catch (error) {
//       setMessage("Something went wrong. Try again.");
//     }
//   };

//   return (
//     <div className="forgot-pin-container">
//       <h2>Reset PIN</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Enter your registered email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <button type="submit">Send Reset Link</button>
//       </form>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default ForgotPin;
