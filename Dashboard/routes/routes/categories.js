const express = require("express");
const CategoryRoute = express.Router();
const categoryModel = require("../../models/categories");
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
const storagePath = path.join(__dirname, "../../storage/categoryimages");
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

// CategoryRoute.post(
//   "/create-category",
//   adminAuth,
//   upload.single("categoryImage"),
//   async (req, res) => {
//     try {
//       if (req.file) {
//         req.body.categoryImage = req.file.filename; // Save only the file name
//       } else {
//         req.body.categoryImage = ""; // Default empty string
//         console.log("⚠️ No file uploaded");
//       }

//       // Use correct model name - adjust if your model is named differently
//       const categories = new categoryModel(req.body);
//       await categories.save();
//       const now = moment();
//       const notification = new notificationsModel({
//         notificationTitle: "Category Created",
//         message: `The category titled "${
//           categories.categoryName || "Untitled"
//         }" was created successfully.`,
//         date: now.format("YYYY-MM-DD"),
//         time: now.format("h:mm A"),
//         source:"dashboard",
//         type: "warning", // optional: can be used for styling
//       });

//       await notification.save();

//       res.json({ message: "category added successfully", categories });
//     } catch (error) {
//       console.error("❌ Error adding category:", error);
//       res
//         .status(400)
//         .json({ message: "Error adding category", error: error.message });
//     }
//   }
// );

function generateSimpleId() {
  const prefix = "CAT";
  const digits = Math.floor(1000 + Math.random() * 9000); // random 4-digit number from 1000 to 9999
  return prefix + digits; // e.g. CAT1234
}

CategoryRoute.post(
  "/create-category",
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      if (req.file) {
        req.body.categoryImage = req.file.filename;
      } else {
        req.body.categoryImage = "";
        console.log("⚠️ No file uploaded");
      }

      req.body.shortId = generateSimpleId();

      const categories = new categoryModel(req.body);
      await categories.save();

      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "Category Created",
        message: `The category titled "${
          categories.categoryName || "Untitled"
        }" was created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "warning", // optional: can be used for styling
      });
      await notification.save();

      res.json({ message: "category added successfully", categories });
    } catch (error) {
      console.error("❌ Error adding category:", error);
      res.status(400).json({ message: "Error adding category", error: error.message });
    }
  }
);

CategoryRoute.delete("/delete-category/:id",  async (req, res) => {
  try {
    const _id = req.params.id;

    // Validate the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const deletedcategory = await categoryModel.findByIdAndDelete(_id);

    if (!deletedcategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Category Deleted",
      message: `The category titled "${
        deletedcategory.categoryName || "Untitled"
      }" was deleted.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source:"dashboard",
      type: "warning", // optional: can be used for styling
    });

    await notification.save();
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(500)
      .json({ error: error.message || "Error deleting the category" });
  }
});

CategoryRoute.get("/category", async (req, res) => {
  try {
    // Fetch category data from DB (example)
    const category = await categoryModel.findOne(); // or .findOne(), depending on your schema

    if (!category || category.length === 0) {
      return res.status(404).json({ error: "No category data found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


CategoryRoute.get("/categories", async (req, res) => {
  try {
    const categories = await categoryModel.find();

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found" });
    }

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error in categories route:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

CategoryRoute.get("/count-categories", async (req, res) => {
  try {
    const categories = await categoryModel.find();

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found", count: 0, categorys: [] });
    }

    res.json({ count: categories.length, categories });
  } catch (error) {
    console.error("Error fetching categories count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});

CategoryRoute.put(
  "/update-category/:id",
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      const categorysId = req.params.id;

      console.log("Received update request for categorys ID:", categorysId);
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      if (!categorysId) {
        return res
          .status(400)
          .json({ error: "categories ID is required for updating" });
      }

      if (!isValidObjectId(categorysId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      let categorys = await categoryModel.findById(categorysId);
      if (!categorys) {
        return res.status(404).json({ error: "categories not found" });
      }
      // Update category title
      if (req.body.categoryName) {
        categorys.categoryName = req.body.categoryName;
      }

       if (req.body.Description) {
        categorys.Description = req.body.Description;
      }

      // Update image only if a new file is uploaded
      if (req.file) {
        if (categorys.categoryImage) {
          const oldImagePath = path.join(
            __dirname,
            "../uploads",
            categorys.categoryImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Old image deleted:", categorys.categoryImage);
          }
        }
        categorys.categoryImage = req.file.filename;
      }

      await categorys.save();
      
      const now = moment(); // current time

      const newNotification = new notificationsModel({
        notificationTitle: "category Updated",
        message: `The category titled "${
          categorys.categoryName || categorys
        }" has been successfully updated.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
      });

      await newNotification.save();

      return res.json({
        message: "categories updated successfully",
        categorys,
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      // Return exact error message to client
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong" });
    }
  }
);

CategoryRoute.get("/search-categories", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.body;

    const category = await categoryModel.findOne(searchCriteria);
    if (!category) {
      // If no category found, return 404 with exact message
      return res.status(404).json({ error: "category not found" });
    }
    res.json(category);
  } catch (error) {
    // Return exact error message for debugging
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

CategoryRoute.post(
  "/bulk-upload-categorys",
  adminAuth,
  uploadCSV.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const categories = [];

      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          categories.push({
            shortId: generateSimpleId(), // <-- generate shortId here
            categoryName: row.categoryName?.trim() || "Unnamed category",
            Description: row.Description?.trim() || "",
          });
        })
        .on("end", async () => {
          if (categories.length === 0) {
            return res.status(400).json({ message: "CSV file is empty or invalid" });
          }

          try {
            await categoryModel.insertMany(categories, { ordered: false });
            fs.unlinkSync(req.file.path);
            res.json({ message: "Upload successful, data inserted into MongoDB" });
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

module.exports = CategoryRoute;
