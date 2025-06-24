// const express = require("express");
// const mysql = require("mysql2");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config(); // Load environment variables
// // require("./reminderScheduler.js"); // Start cron job
// require("./reminderScheduler.js"); // ✅ Start cron job


// const app = express();
// const PORT = 5000;
// const JWT_SECRET = process.env.JWT_SECRET_KEY;
// const { OAuth2Client } = require("google-auth-library"); // ✅ Import Google Auth Library
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // ✅ Use env variable

// if (!JWT_SECRET) {
//     console.error("FATAL ERROR: JWT_SECRET_KEY is missing!");
//     process.exit(1);
// }

// // Enable CORS for frontend
// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         methods: "GET,POST,PUT,DELETE",
//         allowedHeaders: "Content-Type,Authorization",
//     })
// );

// // Middleware
// app.use(bodyParser.json());
// app.use(express.json());

// // MySQL Connection Pool
// const db = mysql.createPool({
//     host: "localhost",
//     user: "root", // Replace with your MySQL username
//     password: "", // Replace with your MySQL password
//     database: "todo_app",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");


// // Verify MySQL Connection
// db.getConnection((err, connection) => {
//     if (err) {
//         console.error("Database connection error:", err.message);
//         process.exit(1);
//     }
//     console.log("Connected to MySQL database.");
//     connection.release();
// });

// // Function to get user by email from DB
// //Searches for a user by email in the database.

// const getUserByEmail = (email) => {
//     return new Promise((resolve, reject) => {
//         db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results[0] || null); // Returns the first matching user or null
//             }
//         });
//     });
// };

// // Middleware: Verify JWT Token
// const authenticateToken = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1]; // ✅ Extract Bearer Token
  
//     if (!token) {
//       return res.status(401).json({ message: "Access denied. No token provided." });
//     }
  
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET);
//       req.userId = decoded.id; // ✅ Store user ID
//       req.email = decoded.email; // ✅ Store user email
//       next(); // ✅ Allow request to continue
//     } catch (err) {
//       res.status(403).json({ message: "Invalid token." });
//     }
//   };
  
//   app.get("/tasks", authenticateToken, (req, res) => {
//     db.query("SELECT * FROM tasks WHERE user_id = ?", [req.userId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error" });

//         results = results.map(task => ({
//             ...task,
//             task_date:task.task_date ? new Date(task.task_date).toISOString() : null
//         }));

//         res.json(results);
//     });
// });


//   app.post("/google-login", async (req, res) => {
//     try {
//         const { token } = req.body;

//         // Verify Google token
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID, // ✅ Use env variable for security
//         });

//         const payload = ticket.getPayload(); // ✅ Get Google user data
//         const email = payload.email; // ✅ Get user email
//         const userId = payload.sub; // ✅ Google user ID
//         const name = payload.name; // ✅ Get user's full name
//         const profilePic = payload.picture; // ✅ Get user's profile picture

//         console.log("Google User Verified:", payload);

//         // ✅ Check if user exists in the database
//         db.query("SELECT * FROM google_users WHERE google_id = ?", [userId], async (err, results) => {
//             if (err) {
//                 console.error("Database error:", err);
//                 return res.status(500).json({ error: "Database error" });
//             }

//             if (results.length === 0) {
//                 // ✅ User doesn't exist, insert into database
//                 const insertQuery = "INSERT INTO google_users (google_id, name, email, profile_pic) VALUES (?, ?, ?, ?)";
//                 db.query(insertQuery, [userId, name, email, profilePic], (insertErr) => {
//                     if (insertErr) {
//                         console.error("Error inserting user:", insertErr);
//                         return res.status(500).json({ error: "Failed to save user" });
//                     }
//                     console.log("New Google user saved to database!");
//                 });
//             } else {
//                 console.log("User already exists, skipping insert.");
//             }

//             // ✅ Issue a new JWT for the session
//             const jwtToken = jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: "28d" });

//             res.json({ success: true, token: jwtToken });
//         });
//     } catch (error) {
//         console.error("Google Login Verification Failed:", error);
//         res.status(401).json({ error: "Invalid Google token" });
//     }
// });

  

// // Manual Registration
// app.post("/register", async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
  
//     try {
//       const existingUser = await getUserByEmail(email);
//       if (existingUser) return res.status(409).json({ message: "User already exists." });
  
//       const hashedPassword = bcrypt.hashSync(password, 10);
//       db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err, result) => {
//         if (err) return res.status(500).json({ message: "Error registering user." });
  
//         const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: "7d" });
//         res.status(201).json({ token });
//       });
//     } catch (err) {
//       res.status(500).json({ message: "Server error." });
//     }
//   });
  
//   // Google Email Verification (for manual registration)
// //   app.post("/register/verify-email", async (req, res) => {
// //     const { email, token } = req.body;
// //     try {
// //       const ticket = await client.verifyIdToken({
// //         idToken: token,
// //         audience: process.env.GOOGLE_CLIENT_ID,
// //       });
// //       const payload = ticket.getPayload();
  
// //       if (payload.email.toLowerCase() !== email.toLowerCase()) {
// //         console.error("Email mismatch:", {
// //           enteredEmail: email,
// //           googleEmail: payload.email,
// //         });
// //         return res.status(400).json({ message: "Email mismatch with Google account." });
// //       }
  
// //       res.status(200).json({ message: "Email verified." });
// //     } catch (err) {
// //       console.error("Google token verification failed:", err);
// //       return res.status(401).json({ message: "Invalid Google token." });
// //     }
// //   });
// app.post("/register/verify-email", async (req, res) => {
//     const { email, token } = req.body;
  
//     try {
//       const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.GOOGLE_CLIENT_ID,
//       });
//       const payload = ticket.getPayload();
  
//       if (payload.email.toLowerCase() !== email.toLowerCase()) {
//         console.error("Email mismatch:", {
//           enteredEmail: email,
//           googleEmail: payload.email,
//         });
//         return res.status(400).json({ message: "Email mismatch with Google account." });
//       }
  
//       const userId = payload.sub;
//       const name = payload.name;
//       const profilePic = payload.picture;
  
//       // ✅ Check if user already exists
//       db.query("SELECT * FROM google_users WHERE google_id = ?", [userId], (err, results) => {
//         if (err) {
//           console.error("Database error:", err);
//           return res.status(500).json({ message: "Database error" });
//         }
  
//         if (results.length === 0) {
//           // ✅ Insert new user
//           const insertQuery = "INSERT INTO google_users (google_id, name, email, profile_pic) VALUES (?, ?, ?, ?)";
//           db.query(insertQuery, [userId, name, email, profilePic], (insertErr) => {
//             if (insertErr) {
//               console.error("Error inserting user:", insertErr);
//               return res.status(500).json({ message: "Failed to save user" });
//             }
//             console.log("New Google user registered!");
//             return res.status(200).json({ message: "Email verified and user registered." });
//           });
//         } else {
//           console.log("User already exists during verify-email.");
//           return res.status(200).json({ message: "Email verified. User already registered." });
//         }
    
//       });
//     } catch (err) {
//       console.error("Google token verification failed:", err);
//       return res.status(401).json({ message: "Invalid Google token." });
//     }
//   });
  
  
// // User Login
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await getUserByEmail(email);
//         if (!user || !bcrypt.compareSync(password, user.password)) {
//             return res.status(401).json({ message: "Invalid credentials." });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
//             expiresIn: "7d", // Token expires in 7 days
//         });

//         res.status(200).json({ token });
//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).json({ message: "Server error." });
//     }
// });




// // app.get("/tasks", authenticateToken, (req, res) => {
// //     const { date } = req.query;
// //     if (!date) {
// //         return res.status(400).json({ message: "Date parameter is required." });
// //     }

// //     const query = "SELECT * FROM tasks WHERE user_id = ? AND task_date = ?";
// //     db.query(query, [req.userId, date], (err, results) => {
// //         if (err) {
// //             console.error("Error fetching tasks:", err);
// //             return res.status(500).json({ message: "Database error", error: err.message });
// //         }
// //         res.json(results);
// //     });
// // });


// // Add Task
// app.post("/tasks", authenticateToken, (req, res) => {
//     let { task_text, task_date, priority } = req.body;

//     if (!task_text || !task_date || !priority) {
//         return res.status(400).json({ message: "Task text, date, and priority are required." });
//     }

//     const taskDateLocal = task_date.replace("T", " ") + ":00";

//     const query = "INSERT INTO tasks (user_id, task_text, task_date, priority) VALUES (?, ?, ?, ?)";
//     db.query(query, [req.userId, task_text, taskDateLocal, priority], (err, result) => {
//         if (err) {
//             console.error("Database Insert Error:", err);
//             return res.status(500).json({ message: "Error adding task." });
//         }
//         res.status(201).json({
//             message: "Task added successfully.",
//             task_id: result.insertId,
//         });
//     });
// });


 

// // Delete Task
// app.delete("/tasks/:id", authenticateToken, (req, res) => {
//     const { id } = req.params;
//     const query = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
//     db.query(query, [id, req.userId], (err, result) => {
//         if (err) {
//             console.error("Error deleting task:", err);
//             return res.status(500).json({ message: "Error deleting task." });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Task not found." });
//         }
//         res.json({ message: "Task deleted successfully." });
//     });
// });

// // Update Task Text and Date (without marking as done)
// app.put("/tasks/:id", authenticateToken, (req, res) => {
//     const { id } = req.params;
//     const { task_text, task_date, priority } = req.body;  // ✅ Include priority

//     if (!task_text || !task_date || !priority) {
//         return res.status(400).json({ message: "Task text, date, and priority are required." });
//     }

//     const query = "UPDATE tasks SET task_text = ?, task_date = ?, priority = ? WHERE id = ? AND user_id = ?";
//     db.query(query, [task_text, task_date, priority, id, req.userId], (err, result) => {
//         if (err) {
//             console.error("Error updating task:", err);
//             return res.status(500).json({ message: "Error updating task." });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Task not found or unauthorized." });
//         }

//         res.json({ message: "Task updated successfully." });
//     });
// });


// // ✅ Backend API for marking task as done
// app.put("/tasks/:id/done", authenticateToken, (req, res) => {
//     const { id } = req.params;
//     const query = "UPDATE tasks SET is_done = 1 WHERE id = ? AND user_id = ?";
    
//     db.query(query, [id, req.userId], (err, result) => {
//         if (err) {
//             console.error("Error marking task as done:", err);
//             return res.status(500).json({ message: "Error marking task as done." });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Task not found or unauthorized." });
//         }
//         res.json({ message: "Task marked as done." });
//     });
// });


// app.get("/notes", authenticateToken, (req, res) => {
//     const id = req.userId; // Corrected here

//     console.log(`📌 Fetching notes for user_id: ${id}`);

//     db.query("SELECT * FROM notes WHERE user_id = ?", [id], (err, results) => {
//         if (err) {
//             console.error("🔥 Error fetching notes:", err);
//             return res.status(500).json({ message: "Internal Server Error", error: err.message });
//         }
//         const uniqueNotes = results.reduce((acc, note) => {
//             if (!acc.find(n => n.id === note.id)) acc.push(note);
//             return acc;
//         }, []);

//         console.log(`✅ Notes fetched successfully. Found: ${results.length} notes.`);
//         res.json(uniqueNotes);
//     });
// });

// // API to Add a Note (Using Callbacks)
// app.post("/notes", authenticateToken, (req, res) => {
//     const user_id = req.userId;
//     const { text } = req.body;

//     if (!user_id) {
//         console.error("❌ Error: User ID is missing in the request.");
//         return res.status(401).json({ message: "Unauthorized: User ID missing." });
//     }

//     if (!text) {
//         console.error("❌ Error: Note text is missing.");
//         return res.status(400).json({ message: "Note text is required." });
//     }

//     console.log(`📌 Inserting note for user_id: ${user_id}, text: "${text}"`);

//     db.query("INSERT INTO notes (user_id, text) VALUES (?, ?)", [user_id, text], (err, result) => {
//         if (err) {
//             console.error("🔥 SQL Insert Error:", err);
//             return res.status(500).json({ message: "Error inserting note.", error: err.message });
//         }

//         console.log(`✅ Insert Successful. Note ID: ${result.insertId}`);
//         res.status(201).json({ id: result.insertId, text, user_id });
//     });
// });


// app.delete("/notes/:id", authenticateToken, (req, res) => {
//     const user_id = req.userId;
//     const { id } = req.params;

//     if (!id || isNaN(id)) {
//         return res.status(400).json({ message: "Invalid note ID." });
//     }

//     console.log(`Attempting to delete note ID: ${id} for user: ${user_id}`);

//     db.query("DELETE FROM notes WHERE id = ? AND user_id = ?", [id, user_id], (err, result) => {
//         if (err) {
//             console.error("🔥 Error deleting note:", err);
//             return res.status(500).json({ message: "Error deleting note." });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Note not found or unauthorized" });
//         }

//         res.json({ message: "Note deleted successfully" });
//     });
// });


// app.put('/notes/:id', authenticateToken, (req, res) => {
//     const user_id = req.userId;
//     const noteId = req.params.id;
//     const { text } = req.body;

//     if (!text) {
//         return res.status(400).json({ message: "Note text is required." });
//     }

//     db.query("UPDATE notes SET text = ? WHERE id = ? AND user_id = ?", 
//         [text, noteId, user_id], 
//         (err, result) => {
//             if (err) {
//                 console.error("🔥 Error updating note:", err);
//                 return res.status(500).json({ message: "Server error", error: err.message });
//             }
//             if (result.affectedRows === 0) {
//                 return res.status(404).json({ message: "Note not found or unauthorized" });
//             }
//             res.json({ id: noteId, text });
//         }
//     );
// });

// // Save search history
// app.post("/weather/search", authenticateToken, (req, res) => {
//     const { country, city } = req.body;
//     if (!country || !city) return res.status(400).json({ message: "Country and City are required." });
//     const query = "INSERT INTO weather_searches (user_id, country, city) VALUES (?, ?, ?)";
//     db.query(query, [req.userId, country, city], (err) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err.message });
//         res.status(201).json({ message: "Search saved." });
//     });
// });

// // Get search history
// app.get("/weather/history", authenticateToken, (req, res) => {
//     const query = "SELECT country, city, created_at FROM weather_searches WHERE user_id = ? ORDER BY created_at DESC";
//     db.query(query, [req.userId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err.message });
//         res.json(results);
//     });
// });


// // Add to favorites
// app.post("/weather/favorite", authenticateToken, (req, res) => {
//     const { country, city } = req.body;

//     if (!country || !city) {
//         return res.status(400).json({ message: "Country and City are required." });
//     }

//     const query = `
//         INSERT INTO favorites (user_id, country, city) 
//         VALUES (?, ?, ?) 
//         ON DUPLICATE KEY UPDATE country = VALUES(country), city = VALUES(city)
//     `;

//     db.query(query, [req.userId, country, city], (err) => {
//         if (err) {
//             return res.status(500).json({ message: "Database error", error: err.message });
//         }
//         res.status(201).json({ message: "City added to favorites successfully." });
//     });
// });

// // Get favorites
// app.get("/weather/favorites", authenticateToken, (req, res) => {
//     const query = "SELECT country, city FROM favorites WHERE user_id = ?";
    
//     db.query(query, [req.userId], (err, results) => {
//         if (err) {
//             return res.status(500).json({ message: "Database error", error: err.message });
//         }
//         res.json(results.map(row => ({ country: row.country, city: row.city }))); // Ensuring both country and city are sent
//     });
// });

// //Delete favorites
// app.delete("/weather/favorite", authenticateToken, (req, res) => {
//     // Ensure request body is parsed correctly
//     const { country, city } = req.body;
    
//     if (!country || !city) {
//         return res.status(400).json({ message: "Country and City are required." });
//     }

//     const query = "DELETE FROM favorites WHERE user_id = ? AND country = ? AND city = ?";
//     db.query(query, [req.userId, country, city], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: "Database error", error: err.message });
//         }

//         if (result.affectedRows > 0) {
//             res.status(200).json({ message: "Favorite removed successfully." });
//         } else {
//             res.status(404).json({ message: "Favorite not found." });
//         }
//     });
// });



// // Fetch calculator history from database
// app.get('/calculator', (req, res) => {
//     db.query("SELECT * FROM calculator ORDER BY created_at DESC", (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// // Save new calculation
// app.post('/calculator', (req, res) => {
//     const { expression, result } = req.body;
//     db.query("INSERT INTO calculator (expression, result) VALUES (?, ?)", [expression, result], (err) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: "Saved successfully!" });
//     });
// });

// // Clear history
// app.delete('/calculator', (req, res) => {
//     db.query("DELETE FROM calculator", (err) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: "History cleared!" });
//     });
// });


// app.get("/weeklyplanner", authenticateToken, (req, res) => {
//     const todayDate = new Date().toISOString().split("T")[0];
//     const userId = req.userId;
  
//     const query = `
//       SELECT *, 
//         CASE 
//           WHEN task_done_date = ? THEN 1 
//           ELSE 0 
//         END AS done 
//       FROM weeklyplanner
//       WHERE user_id = ?
//     `;
  
//     db.query(query, [todayDate, userId], (err, results) => {
//       if (err) {
//         console.error("Error fetching tasks:", err);
//         return res.status(500).json({ error: "Failed to fetch tasks" });
//       }
  
//       res.json(results);
//     });
//   });
//   app.post('/weeklyplanner', authenticateToken, (req, res) => {
//     const { title, day, time, repeatWeekly, task_date } = req.body;
//     const userId = req.userId;
  
//     if (!title || !day || !time || !task_date) {
//       return res.status(400).json({ error: "All fields are required" });
//     }
  
//     const query = `
//       INSERT INTO weeklyplanner (title, day, time, repeatWeekly, task_date, user_id) 
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;
  
//     db.query(query, [title, day, time, repeatWeekly, task_date, userId], (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
  
//       res.json({ id: result.insertId, title, day, time, repeatWeekly, task_date });
//     });
//   });
//   app.put("/weeklyplanner/:id", authenticateToken, (req, res) => {
//     const taskId = req.params.id;
//     const todayDate = new Date().toISOString().split("T")[0];
//     const userId = req.userId;
  
//     const query = `
//       UPDATE weeklyplanner 
//       SET task_done_date = 
//         CASE 
//           WHEN task_done_date = ? THEN NULL 
//           ELSE ? 
//         END
//       WHERE id = ? AND user_id = ?
//     `;
  
//     db.query(query, [todayDate, todayDate, taskId, userId], (err, result) => {
//       if (err) {
//         console.error("Error updating task:", err);
//         return res.status(500).json({ error: "Failed to update task" });
//       }
  
//       res.json({ message: "Task updated successfully" });
//     });
//   });
//   app.delete("/weeklyplanner/:id", authenticateToken, (req, res) => {
//     const id = req.params.id;
//     const userId = req.userId;
  
//     const query = `DELETE FROM weeklyplanner WHERE id = ? AND user_id = ?`;
  
//     db.query(query, [id, userId], (err, result) => {
//       if (err) {
//         console.error("Error deleting task:", err);
//         return res.status(500).json({ error: "Failed to delete task" });
//       }
  
//       res.status(200).json({ message: "Task deleted successfully" });
//     });
//   });

// app.post("/forgot-pin", async (req, res) => {
//   const { email, newPin } = req.body;

//   if (!email || !newPin) {
//     return res.status(400).json({ message: "Email and new PIN are required." });
//   }

//   try {
//     const user = await getUserByEmail(email);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const hashedPin = bcrypt.hashSync(newPin, 10);

//     // Update the user's password (PIN)
//     db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPin, email], (err) => {
//       if (err) {
//         console.error("Error updating PIN:", err);
//         return res.status(500).json({ message: "Server error." });
//       }

//       res.json({ message: "PIN updated successfully." });
//     });
//   } catch (error) {
//     console.error("Forgot PIN error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// });

// const UPLOAD_DIR = path.join(__dirname, "uploads");

// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR);
// }
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, UPLOAD_DIR);
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//       cb(null, filename);
//     },
//   });
//   app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//   const upload = multer({ storage });
//   app.post("/upload-avatar", authenticateToken, upload.single("avatar"), (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
  
//     const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  
//     // Optional: Save the image URL to the user's record in DB here
  
//     res.status(200).json({ message: "Image uploaded successfully", imageUrl });
//   });
    

// // Start Server
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
// server.js (MongoDB Version)



const express = require("express");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { OAuth2Client } = require("google-auth-library");

const User = require("./models/users");
const GoogleUser = require("./models/googleUsers");
const Task = require("./models/tasks");
const Note = require("./models/notes");

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET_KEY is missing!");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB."))
.catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.use(express.json());


// Middleware: Verify JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // ✅ Extract Bearer Token
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id; // ✅ Store user ID
      req.email = decoded.email; // ✅ Store user email
      next(); // ✅ Allow request to continue
    } catch (err) {
      res.status(403).json({ message: "Invalid token." });
    }
  };

// User registration
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required." });
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "User exists." });
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token });
    } catch {
        res.status(500).json({ message: "Server error." });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: "Invalid credentials." });
        const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    } catch {
        res.status(500).json({ message: "Server error." });
    }
});



app.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    // ✅ Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const userId = payload.sub; // Google unique user ID
    const name = payload.name;
    const profilePic = payload.picture;

    console.log("Google User Verified:", payload);

    // ✅ Check if user exists
    let user = await GoogleUser.findOne({ google_id: userId });

    if (!user) {
      // ✅ Create new user
      user = await GoogleUser.create({
        google_id: userId,
        name,
        email,
        profile_pic: profilePic,
      });

      console.log("New Google user saved to database!");
    } else {
      console.log("User already exists, skipping insert.");
    }

    // ✅ Sign JWT (you can optionally use user._id instead of google_id)
    const jwtToken = jwt.sign(
      { id: user.google_id, email, name },
      JWT_SECRET,
      { expiresIn: "28d" }
    );

    res.json({ success: true, token: jwtToken });
  } catch (error) {
    console.error("Google Login Verification Failed:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
});


//Tasks
app.get("/tasks", authenticateToken, async (req, res) => {
  try {
    let tasks = await Task.find({ user_id: req.userId });

    // Convert task_date to ISO format like in MySQL version
    tasks = tasks.map(task => ({
      ...task.toObject(),
      task_date: task.task_date ? task.task_date.toISOString() : null,
    }));

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Database error" });
  }
});


app.post("/tasks", authenticateToken, async (req, res) => {
    const { task_text, task_date, priority } = req.body;

    if (!task_text || !task_date || !priority) {
        return res.status(400).json({ message: "Task text, date, and priority are required." });
    }

    try {
        const newTask = await Task.create({
            user_id: req.userId,
            task_text,
            task_date,
            priority
        });

        res.status(201).json({
            message: "Task added successfully.",
            task_id: newTask._id
        });
    } catch (err) {
        console.error("Error adding task:", err);
        res.status(500).json({ message: "Error adding task." });
    }
});
app.put("/tasks/:id/done", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user_id: req.userId },
            { is_done: true },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized." });
        }

        res.json({ message: "Task marked as done." });
    } catch (err) {
        console.error("Error marking task as done:", err);
        res.status(500).json({ message: "Error marking task as done." });
    }
});

app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Task.findOneAndDelete({ _id: id, user_id: req.userId });

        if (!result) {
            return res.status(404).json({ message: "Task not found or unauthorized." });
        }

        res.json({ message: "Task deleted successfully." });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ message: "Error deleting task." });
    }
});


app.put("/tasks/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { task_text, task_date, priority } = req.body;

    if (!task_text || !task_date || !priority) {
        return res.status(400).json({ message: "Task text, date, and priority are required." });
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user_id: req.userId },
            { task_text, task_date, priority },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized." });
        }

        res.json({ message: "Task updated successfully." });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ message: "Error updating task." });
    }
});


// Notes
app.get("/notes", authenticateToken, async (req, res) => {
    const notes = await Note.find({ user_id: req.userId });
    res.json(notes);
});

app.post("/notes", authenticateToken, async (req, res) => {
    const { text } = req.body;
    const note = await Note.create({ user_id: req.userId, text });
    res.status(201).json({ note });
});

app.put("/notes/:id", authenticateToken, async (req, res) => {
    const { text } = req.body;
    await Note.findOneAndUpdate({ _id: req.params.id, user_id: req.userId }, { text });
    res.json({ message: "Note updated." });
});

app.delete("/notes/:id", authenticateToken, async (req, res) => {
    await Note.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    res.json({ message: "Note deleted." });
});

// Image Upload
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });
app.use("/uploads", express.static(UPLOAD_DIR));

app.post("/upload-avatar", authenticateToken, upload.single("avatar"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ message: "Image uploaded.", imageUrl });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));