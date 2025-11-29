const express = require("express");
const contactusRoute = express.Router();
const contactusModel = require("../../models/contactus");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth")

const {isValidObjectId} = require("../../utils/validation");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");
const { adminAuth } = require("../../middlewares/adminAuth");


contactusRoute.post("/create-Support",userAuth,async (req, res) => {
  try {
    
    const contactus = new contactusModel(req.body);
    await contactus.save();

        const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "Message Received",
        message: `The message titled "${
          contactus.firstName || "Untitled"
        }" was received successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "warning", // optional: can be used for styling
      });
      await notification.save();

    res.json({ message: "contactus Created successfully", contactus });
  } catch (error) {
    console.error("Error adding  the contactus:", error);
    res.status(400).json({ message: "Error adding  the contactus", error });
  }
});

contactusRoute.get("/contact-messages",adminAuth,async (req, res) => {
  try {
    const messages = await contactusModel.find();

    if (!messages || messages.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No messages found" });
    }

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error in messages route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


contactusRoute.delete("/delete-message/:id", adminAuth, async (req, res) => {
  try {
    const _id = req.params.id;

    // Validate the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const deletedmessage = await contactusModel.findByIdAndDelete(_id);

    if (!deletedmessage) {
      return res.status(404).json({ error: "contact not found" });
    }

    res.json({ message: "contact deleted successfully" });
    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "contact Deleted",
      message: `The contact titled "${
        deletedmessage.firstName || "Untitled"
      }" was deleted.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source:"dashboard",
      type: "warning", // optional: can be used for styling
    });

    await notification.save();
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ error: error.message || "Error deleting the message" });
  }
});


module.exports = contactusRoute;