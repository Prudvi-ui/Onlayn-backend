const express = require("express");
const subCategoryRoute = express.Router();
const subcategoryModel = require("../../models/subcategory");
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
const storagePath = path.join(__dirname, "../../../storage/subcategoryimages");
const moment = require("moment");
const notificationsModel = require("../../models/notifications");

// Create a folder for CSV files
const csvStoragePath = path.join(__dirname, "../../../storage/csvfiles");
if (!fs.existsSync(csvStoragePath)) {
  fs.mkdirSync(csvStoragePath, { recursive: true });
  console.log("CSV Directory created:", csvStoragePath);
} else {
  console.log("CSV Directory already exists:", csvStoragePath);
}

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log("Directory created:", storagePath);
} else {
  console.log("Directory already exists:", storagePath);
}

// Multer storage configuration for CSV files
const csvConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, csvStoragePath); // Save CSV files to the specified folder
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname)); // Generate unique file names
  },
});

// Upload middleware for CSV files
const uploadCSV = multer({
  storage: csvConfig,
  limits: {
    fileSize: 1000000000, // File size limit for CSV files
  },
});

// Multer storage configuration
const imageconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storagePath); // Use absolute path
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});
var upload = multer({
  storage: imageconfig,
  limits: {
    fileSize: 1000000000,
  },
});



subCategoryRoute.get("/subcategory", async (req, res) => {
  try {
    // Fetch category data from DB (example)
    const subcategory = await subcategoryModel.findOne(); // or .findOne(), depending on your schema

    if (!subcategory || subcategory.length === 0) {
      return res.status(404).json({ error: "No subcategory data found" });
    }

    res.json(subcategory);
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


subCategoryRoute.get("/subcategories", async (req, res) => {
  try {
    const subcategories = await subcategoryModel.find();

    if (!subcategories || subcategories.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subcategories found" });
    }

    res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    console.error("Error in /subcategories route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

subCategoryRoute.get("/count-subcategories", async (req, res) => {
  try {
    const subcategories = await subcategoryModel.find();

    if (!subcategories || subcategories.length === 0) {
      return res
        .status(404)
        .json({ message: "No subcategories found", count: 0, subcategory: [] });
    }

    res.json({ count: subcategories.length, subcategories });
  } catch (error) {
    console.error("Error fetching subcategories count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});



subCategoryRoute.get("/search-subcategories", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.body;

    const subcategory = await subcategoryModel.findOne(searchCriteria);
    if (!subcategory) {
      // If no category found, return 404 with exact message
      return res.status(404).json({ error: "subcategory not found" });
    }
    res.json(subcategory);
  } catch (error) {
    // Return exact error message for debugging
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = subCategoryRoute;
