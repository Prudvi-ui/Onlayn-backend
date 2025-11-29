const express = require("express");
const TaskRoute = express.Router();
const tasksModel = require("../../models/tasks");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { adminAuth } = require("../../middlewares/adminAuth");
const { isValidObjectId } = require("../../utils/validation");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
const moment = require("moment");
const notificationsModel = require("../../models/notifications");



TaskRoute.post(
  "/create-task",
  adminAuth,
  async (req, res) => {
    try {
    
      const tasks = new tasksModel(req.body);
      await tasks.save();

      // ✅ Create Notification after saving banner
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "New tasks Created",
        message: `The tasks titled "${tasks.couponCode || "Untitled"}" has been created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "success", // optional: success/info/warning/error
      });

      await notification.save();

      res.json({ message: "task added successfully", tasks });
    } catch (error) {
      console.error("❌ Error adding task:", error);
      res
        .status(400)
        .json({ message: "Error adding task", error: error.message });
    }
  }
);

TaskRoute.delete("/delete-task/:id", adminAuth, async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const deletedTask = await tasksModel.findByIdAndDelete(_id);

  if (!deletedTask) {
    return res.status(404).json({ error: "task not found" });
  }

  // ✅ Create a notification after deletion
  const now = moment();
  const notification = new notificationsModel({
    notificationTitle: "task Deleted",
    message: `The task titled "${deletedTask.taskTitle || "Untitled"}" was deleted.`,
    date: now.format("YYYY-MM-DD"),
    time: now.format("h:mm A"),
    source:"dashboard",
    type: "warning", // optional: can be used for styling
  });

  await notification.save();

  res.json({ message: "tasks deleted successfully" });
});

TaskRoute.get("/task", async (req, res) => {
  try {
    // Fetch banner data from DB (example)
    const task = await tasksModel.findOne(); // or .findOne(), depending on your schema

    if (!task || task.length === 0) {
      return res.status(404).json({ error: "No task data found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

TaskRoute.get("/tasks", async (req, res) => {
  try {
    const tasks = await tasksModel.find();

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tasks found" });
    }

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in /tasks route:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

TaskRoute.get("/count-tasks", async (req, res) => {
  try {
    const tasks = await tasksModel.find();

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found", count: 0, tasks: [] });
    }

    res.json({ count: tasks.length, tasks });
  } catch (error) {
    console.error("Error fetching tasks count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});

TaskRoute.put("/update-tasks", adminAuth, async (req, res) => {
  try {
    const tasksId = req.body._id;

    console.log("Received update request for tasks ID:", tasksId);
    console.log("Request body:", req.body);

    if (!tasksId) {
      return res
        .status(400)
        .json({ error: "task ID is required for updating" });
    }

    if (!isValidObjectId(tasksId)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    let task = await tasksModel.findById(tasksId);
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    // Update all fields present in request body
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key) && key !== "_id") {
        task[key] = req.body[key];
      }
    }

    await task.save();

    const now = moment();

    const newNotification = new notificationsModel({
      notificationTitle: "task Updated",
      message: `The task "${
        task.taskTitle || tasksId
      }" has been successfully updated.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
    });

    await newNotification.save();

    return res.json({
      message: "task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ error: error.message || "Something went wrong" });
  }
});

TaskRoute.get("/search-tasks", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.query;

    const task = await tasksModel.findOne(searchCriteria);
    if (!task) {
      // If no banner found, return 404 with exact message
      return res.status(404).json({ error: "task not found" });
    }
    res.json(task);
  } catch (error) {
    // Return exact error message for debugging
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = TaskRoute;
