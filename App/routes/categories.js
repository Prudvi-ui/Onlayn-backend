// const express = require("express");
// const CategoryRoute = express.Router();
// const categoryModel = require("../../models/categories");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const { json } = require("body-parser");
// const fs = require("fs");
// const { error } = require("console");
// const { adminAuth } = require("../../middlewares/adminAuth");
// const { isValidObjectId } = require("../../utils/validation");
// const mongoose = require("mongoose");
// const csvParser = require("csv-parser");
// const storagePath = path.join(__dirname, "../../../src/storage/categoryimages");
// const moment = require("moment");
// const notificationsModel = require("../../models/notifications");

// // Create a folder for CSV files
// const csvStoragePath = path.join(__dirname, "../../../storage/csvfiles");
// if (!fs.existsSync(csvStoragePath)) {
//   fs.mkdirSync(csvStoragePath, { recursive: true });
//   console.log("CSV Directory created:", csvStoragePath);
// } else {
//   console.log("CSV Directory already exists:", csvStoragePath);
// }

// if (!fs.existsSync(storagePath)) {
//   fs.mkdirSync(storagePath, { recursive: true });
//   console.log("Directory created:", storagePath);
// } else {
//   console.log("Directory already exists:", storagePath);
// }



// // Multer storage configuration
// const imageconfig = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, storagePath); // Use absolute path
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + path.extname(file.originalname));
//   },
// });
// var upload = multer({
//   storage: imageconfig,
//   limits: {
//     fileSize: 1000000000,
//   },
// });


// CategoryRoute.get("/category", async (req, res) => {
//   try {
//     // Fetch category data from DB (example)
//     const category = await categoryModel.findOne(); // or .findOne(), depending on your schema

//     if (!category || category.length === 0) {
//       return res.status(404).json({ error: "No category data found" });
//     }

//     res.json(category);
//   } catch (error) {
//     console.error("Error fetching category:", error);
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// });


// CategoryRoute.get("/categories", async (req, res) => {
//   try {
//     const categories = await categoryModel.find();

//     if (!categories || categories.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No categories found" });
//     }

//     res.status(200).json({
//       success: true,
//       categories,
//     });
//   } catch (error) {
//     console.error("Error in categories route:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// CategoryRoute.get("/count-categories", async (req, res) => {
//   try {
//     const categories = await categoryModel.find();

//     if (!categories || categories.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No categories found", count: 0, categorys: [] });
//     }

//     res.json({ count: categories.length, categories });
//   } catch (error) {
//     console.error("Error fetching categories count:", error);
//     // Return the exact error message and stack trace (optional)
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//       stack: error.stack,
//     });
//   }
// });



// CategoryRoute.get("/search-categories", async (req, res) => {
//   try {
//     // Use req.query instead of req.body for GET request parameters
//     const searchCriteria = req.body;

//     const category = await categoryModel.findOne(searchCriteria);
//     if (!category) {
//       // If no category found, return 404 with exact message
//       return res.status(404).json({ error: "category not found" });
//     }
//     res.json(category);
//   } catch (error) {
//     // Return exact error message for debugging
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// });



// module.exports = CategoryRoute;

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

CategoryRoute.post(
  "/create-category",
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      if (req.file) {
        req.body.categoryImage = req.file.filename;
      } else {
        req.body.categoryImage = "";
        console.log("⚠ No file uploaded");
      }
      const category = new categoryModel(req.body);
      await category.save();

      // ✅ Create Notification after saving banner
      // const now = moment();
      // const notification = new notificationsModel({
      //   notificationTitle: "New Banner Created",
      //   message: The banner titled "${category.bannerTitle || "Untitled"}" has been created successfully.,
      //   date: now.format("YYYY-MM-DD"),
      //   time: now.format("h:mm A"),
      //   source: "dashboard",
      //   type: "success", // optional: success/info/warning/error
      // });

      // await notification.save();

      res.json({ message: "category added successfully", category });
    } catch (error) {
      console.error("❌ Error adding category:", error);
      res
        .status(400)
        .json({ message: "Error adding category", error: error.message });
    }
  }
);


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



module.exports = CategoryRoute;