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

function generateSimpleId() {
  const prefix = "CAT";
  const digits = Math.floor(1000 + Math.random() * 9000); // random 4-digit number from 1000 to 9999
  return prefix + digits; // e.g. CAT1234
}

subCategoryRoute.post(
  "/create-sub-category",
  adminAuth,
  upload.single("subcategoryImage"),
  async (req, res) => {
    try {
      if (req.file) {
        req.body.subcategoryImage = req.file.filename; // Save only the file name
      } else {
        req.body.subcategoryImage = ""; // Default empty string
        console.log("⚠️ No file uploaded");
      }
      req.body.shortId = generateSimpleId();
      // Use correct model name - adjust if your model is named differently
      const subcategories = new subcategoryModel(req.body);
      await subcategories.save();
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "Sub-Category Created",
        message: `The subcategory titled "${
          subcategories.subcategoryName || "Untitled"
        }" was created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
        type: "warning", // optional: can be used for styling
      });

      await notification.save();

      res.json({ message: "subcategory added successfully", subcategories });
    } catch (error) {
      console.error("❌ Error adding subcategory:", error);
      res
        .status(400)
        .json({ message: "Error adding subcategory", error: error.message });
    }
  }
);

subCategoryRoute.delete(
  "/delete-subcategory/:id",
  adminAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;

      // Validate the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid subcategory ID" });
      }

      const deletedsubcategory = await subcategoryModel.findByIdAndDelete(_id);

      if (!deletedsubcategory) {
        return res.status(404).json({ error: "subcategory not found" });
      }

      res.json({ message: "subcategory deleted successfully" });
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "subcategory Deleted",
        message: `The subcategory titled "${
          deletedsubcategory.subcategoryName || "Untitled"
        }" was deleted.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
        type: "warning", // optional: can be used for styling
      });

      await notification.save();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res
        .status(500)
        .json({ error: error.message || "Error deleting the subcategory" });
    }
  }
);

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

subCategoryRoute.put(
  "/update-subcategory/:id",
  adminAuth,
  upload.single("subcategoryImage"),
  async (req, res) => {
    try {
      const subcategoryId = req.params.id;

      console.log("Received update request for subcategory ID:", subcategoryId);
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      if (!subcategoryId) {
        return res
          .status(400)
          .json({ error: "subcategories ID is required for updating" });
      }

      if (!isValidObjectId(subcategoryId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      let subcategory = await subcategoryModel.findById(subcategoryId);
      if (!subcategory) {
        return res.status(404).json({ error: "subcategories not found" });
      }
      // Update category title
      if (req.body.subcategoryName) {
        subcategory.subcategoryName = req.body.subcategoryName;
      }

      if (req.body.Description) {
        subcategory.Description = req.body.Description;
      }

      // Update image only if a new file is uploaded
      if (req.file) {
        if (subcategory.subcategoryImage) {
          const oldImagePath = path.join(
            __dirname,
            "../uploads",
            subcategory.subcategoryImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Old image deleted:", subcategory.subcategoryImage);
          }
        }
        subcategory.subcategoryImage = req.file.filename;
      }

      await categorys.save();

      const now = moment(); // current time

      const newNotification = new notificationsModel({
        notificationTitle: "subcategory Updated",
        message: `The subcategory titled "${
          subcategory.subcategoryName || categorys
        }" has been successfully updated.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
      });

      await newNotification.save();

      return res.json({
        message: "subcategories updated successfully",
        categorys,
      });
    } catch (error) {
      console.error("Error updating subcategories:", error);
      // Return exact error message to client
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong" });
    }
  }
);

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

subCategoryRoute.post(
  "/bulk-upload-subcategory",
  adminAuth,
  upload.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const subcategories = [];

      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          subcategories.push({
            shortId: generateSimpleId(), // same as in category
            subcategoryName: row.subcategoryName?.trim() || "Unnamed subcategory",
            categoryType: row.categoryType?.trim() || "General", // <-- category type logic added
            description: row.description?.trim() || "", // optional
          });
        })
        .on("end", async () => {
          if (subcategories.length === 0) {
            return res.status(400).json({ message: "CSV file is empty or invalid" });
          }

          try {
            await subcategoryModel.insertMany(subcategories, { ordered: false });
            fs.unlinkSync(req.file.path);
            res.json({ message: "Upload successful, subcategories inserted into MongoDB" });
          } catch (dbError) {
            console.error("DB insertion error:", dbError);
            res.status(500).json({ message: "Database insertion error", error: dbError.message });
          }
        })
        .on("error", (parseError) => {
          console.error("CSV parsing error:", parseError);
          res.status(400).json({ message: "Error parsing CSV file", error: parseError.message });
        });
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ message: "Error processing upload", error: error.message });
    }
  }
);


module.exports = subCategoryRoute;
