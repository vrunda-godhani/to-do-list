const nodemailer = require("nodemailer");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send email to one user
async function sendReminderEmail(to, subject, text) {
    const logoUrl = "https://yourdomain.com/logo.png"; // 🔁 Replace with your actual logo URL
    const websiteUrl = "http://localhost:3000"; // 🔁 Replace with your deployed React URL

    const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <a href="${websiteUrl}" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl}" alt="App Logo" style="height: 60px; display: block; margin-bottom: 20px;" />
            </a>
            <h2>${subject}</h2>
            <p>${text}</p>
            <a href="${websiteUrl}" style="
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            ">Open App</a>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text, // still include plain text
        html: htmlBody, // 🆕 the HTML version
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to: ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
    }
}

// MySQL connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "todo_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Fetch users and send reminder
async function sendRemindersToAllUsers() {
    try {
        const [rows] = await db.query("SELECT name, email FROM google_users");

        for (const user of rows) {
            if (user.email) {
                const name = user.name || "there"; // fallback if name is null
                await sendReminderEmail(
                    user.email,
                    "🔔 General Reminder",
                    `Hey ${name}, don't forget to check your tasks today!`
                );
            }
        }
    } catch (error) {
        console.error("❌ Failed to fetch users or send reminders:", error.message);
    }
}


// Uncomment this line to test directly by running the file
// sendRemindersToAllUsers();

module.exports = {
    sendReminderEmail,
    sendRemindersToAllUsers,
};
