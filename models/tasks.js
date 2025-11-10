const mongoose = require("mongoose");
const { type } = require("os");

const taskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
    Description: {
      type: String,
    },
    Date:
    {
       type: String, 
    },
    status:
    {
        type: String,
        default:"Pending", 
        enum:["Pending","Completed"]
    },
    assignTo:
    {
        type: String, 
    }
  },
  { timestamps: true }
);

const taskModel = mongoose.model("tasks", taskSchema);
module.exports = taskModel;
