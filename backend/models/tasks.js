const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user_id: {
    type: String, // 🔄 changed from ObjectId
    required: true
  },
  task_text: String,
  task_date: Date,
  priority: String,
  is_done: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Task", TaskSchema);
