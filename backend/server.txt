
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
const fs = require("fs");
const { OAuth2Client } = require("google-auth-library");

const User = require("./models/users");
const GoogleUser = require("./models/googleUsers");
const Task = require("./models/tasks");
const Note = require("./models/notes");

const path = require("path");
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

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));