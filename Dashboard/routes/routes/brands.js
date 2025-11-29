const express = require("express");
const BrandRoute = express.Router();
const brandsModel = require("../../models/brands");
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

// Create a folder for CSV files
const csvStoragePath = path.join(__dirname, "../../../storage/csvfiles");
if (!fs.existsSync(csvStoragePath)) {
  fs.mkdirSync(csvStoragePath, { recursive: true });
  console.log("CSV Directory created:", csvStoragePath);
} else {
  console.log("CSV Directory already exists:", csvStoragePath);
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


BrandRoute.post(
  "/create-brand",
  adminAuth,
  async (req, res) => {
    try {
    
      const brands = new brandsModel(req.body);
      await brands.save();

      // ✅ Create Notification after saving banner
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "New Brands Created",
        message: `The brands titled "${brands.brandName || "Untitled"}" has been created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "success", // optional: success/info/warning/error
      });

      await notification.save();

      res.json({ message: "Brand added successfully", brands });
    } catch (error) {
      console.error("❌ Error adding brand:", error);
      res
        .status(400)
        .json({ message: "Error adding brand", error: error.message });
    }
  }
);

BrandRoute.delete("/delete-brand/:id", adminAuth, async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid brand ID" });
  }

  const deletedBrand = await brandsModel.findByIdAndDelete(_id);

  if (!deletedBrand) {
    return res.status(404).json({ error: "Brand not found" });
  }

  // ✅ Create a notification after deletion
  const now = moment();
  const notification = new notificationsModel({
    notificationTitle: "Brand Deleted",
    message: `The brand titled "${deletedBrand.brandName || "Untitled"}" was deleted.`,
    date: now.format("YYYY-MM-DD"),
    time: now.format("h:mm A"),
    source:"dashboard",
    type: "warning", // optional: can be used for styling
  });

  await notification.save();

  res.json({ message: "Brand deleted successfully" });
});

BrandRoute.get("/brand", async (req, res) => {
  try {
    // Fetch banner data from DB (example)
    const brand = await brandsModel.findOne(); // or .findOne(), depending on your schema

    if (!brand || brand.length === 0) {
      return res.status(404).json({ error: "No brand data found" });
    }

    res.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

BrandRoute.get("/brands", async (req, res) => {
  try {
    const brands = await brandsModel.find();

    if (!brands || brands.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No brands found" });
    }

    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error("Error in brands route:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

BrandRoute.get("/count-brands", async (req, res) => {
  try {
    const brands = await brandsModel.find();

    if (!brands || brands.length === 0) {
      return res
        .status(404)
        .json({ message: "No brands found", count: 0, brands: [] });
    }

    res.json({ count: brands.length, brands });
  } catch (error) {
    console.error("Error fetching brands count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});

BrandRoute.put(
  "/update-brands",
  adminAuth,
  async (req, res) => {
    try {
      const brandsId = req.body._id;

      console.log("Received update request for brands ID:", brandsId);
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      if (!brandsId) {
        return res
          .status(400)
          .json({ error: "brands ID is required for updating" });
      }

      if (!isValidObjectId(brandsId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      let brands = await brandsModel.findById(brandsId);
      if (!brands) {
        return res.status(404).json({ error: "brands not found" });
      }

      // Update banner title
      if (req.body.brandName) {
        brands.brandName = req.body.brandName;
      }

      await brands.save();

      const now = moment(); // current time

      const newNotification = new notificationsModel({
        notificationTitle: "Brand Updated",
        message: `The brand titled "${
          brands.brandName || brandsId
        }" has been successfully updated.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
      });

      await newNotification.save();
      return res.json({
        message: "brands updated successfully",
        brands,
      });
    } catch (error) {
      console.error("Error updating brands:", error);
      // Return exact error message to client
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong" });
    }
  }
);

BrandRoute.get("/search-brands", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.query;

    const banner = await brandsModel.findOne(searchCriteria);
    if (!banner) {
      // If no banner found, return 404 with exact message
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json(banner);
  } catch (error) {
    // Return exact error message for debugging
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = BrandRoute;
