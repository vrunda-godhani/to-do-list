const cron = require("node-cron");
const { sendReminderEmail, sendRemindersToAllUsers } = require("./emailService");
const mysql = require("mysql2/promise");
require("dotenv").config();

// ✅ Setup MySQL connection using DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

const db = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  port: dbUrl.port,
  ssl: {
    rejectUnauthorized: false,
  },
});


// 🔔 Run every 10 minutes to send upcoming task reminders
cron.schedule("*/10 * * * *", async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const nowFormatted = now.toISOString().slice(0, 19).replace("T", " ");
  const oneHourLaterFormatted = oneHourLater.toISOString().slice(0, 19).replace("T", " ");

  try {
    const [rows] = await db.query(
      `SELECT t.task_text, t.task_date, g.email AS user_email
       FROM tasks t
       JOIN google_users g ON t.user_id = g.google_id
       WHERE t.is_done = 0 AND t.task_date BETWEEN ? AND ?`,
      [nowFormatted, oneHourLaterFormatted]
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


// 📅 Run daily at 9:00 AM to send general reminders
cron.schedule("0 9 * * *", async () => {
  try {
    console.log("⏰ Sending daily reminders to all users...");
    await sendRemindersToAllUsers();
  } catch (err) {
    console.error("❌ Daily Reminder error:", err);
  }
});
