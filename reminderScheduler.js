const cron = require("node-cron");
const { sendReminderEmail, sendRemindersToAllUsers } = require("./emailService");
const mysql = require("mysql2/promise");
require("dotenv").config();

// MySQL Pool Setup
const db = mysql.createPool({
    host: "localhost",
    user: "root", // replace if needed
    password: "", // replace if needed
    database: "todo_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// 🔁 Run every 10 minutes for task reminders
cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    try {
        const [rows] = await db.query(
            `SELECT t.task_text, t.task_date, g.email AS user_email
             FROM tasks t
             JOIN google_users g ON t.user_id = g.google_id
             WHERE t.is_done = 0 AND t.task_date BETWEEN ? AND ?`,
            [now, oneHourLater]
        );

        for (const task of rows) {
            if (task.user_email) {
                await sendReminderEmail(
                    task.user_email,
                    "🔔 Task Reminder",
                    `Hey! Don't forget: "${task.task_text}" is due soon!`
                );
            }
        }
    } catch (err) {
        console.error("❌ Reminder error:", err);
    }
});

// 📅 Run daily at 9 AM to send general reminders to all users
cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Sending daily reminders to all users...");
    await sendRemindersToAllUsers();
});
