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
const { adminAuth } = require("../../middlewares/adminAuth")
const {isValidObjectId} = require("../../utils/validation");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");


contactusRoute.post("/create-Support",async (req, res) => {
  try {
    
    const contactus = new contactusModel(req.body);
    await contactus.save();

    res.json({ message: "contactus Created successfully", contactus });
  } catch (error) {
    console.error("Error adding  the contactus:", error);
    res.status(400).json({ message: "Error adding  the contactus", error });
  }
});

module.exports = contactusRoute;