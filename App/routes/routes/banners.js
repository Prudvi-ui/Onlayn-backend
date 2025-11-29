// const express = require("express");
// const BannerRoute = express.Router();
// const bannersModel = require("../../models/banners");
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
// const storagePath = path.join(__dirname, "../../../src/storage/bannerimages");
// const moment = require("moment");
// const notificationsModel = require("../../models/notifications");



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





// BannerRoute.get("/banner", async (req, res) => {
//   try {
//     // Fetch banner data from DB (example)
//     const banner = await bannersModel.findOne(); // or .findOne(), depending on your schema

//     if (!banner || banner.length === 0) {
//       return res.status(404).json({ error: "No banner data found" });
//     }

//     res.json(banner);
//   } catch (error) {
//     console.error("Error fetching banner:", error);
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// });

// BannerRoute.get("/banners", async (req, res) => {
//   try {
//     const banners = await bannersModel.find();

//     if (!banners || banners.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No banners found" });
//     }

//     res.status(200).json({ success: true, banners });
//   } catch (error) {
//     console.error("Error in /banners route:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//   }
// });

// BannerRoute.get("/count-banners", async (req, res) => {
//   try {
//     const banners = await bannersModel.find();

//     if (!banners || banners.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No banners found", count: 0, banners: [] });
//     }

//     res.json({ count: banners.length, banners });
//   } catch (error) {
//     console.error("Error fetching banners count:", error);
//     // Return the exact error message and stack trace (optional)
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//       stack: error.stack,
//     });
//   }
// });



// BannerRoute.get("/search-banners", async (req, res) => {
//   try {
//     // Use req.query instead of req.body for GET request parameters
//     const searchCriteria = req.query;

//     const banner = await bannersModel.findOne(searchCriteria);
//     if (!banner) {
//       // If no banner found, return 404 with exact message
//       return res.status(404).json({ error: "Banner not found" });
//     }
//     res.json(banner);
//   } catch (error) {
//     // Return exact error message for debugging
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// });

// module.exports = BannerRoute;

const express = require("express");
const BannerRoute = express.Router();
const bannersModel = require("../../models/banners");
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
const storagePath = path.join(__dirname, "../../storage/bannerimages");
const moment = require("moment");
const notificationsModel = require("../../models/notifications");



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


BannerRoute.post(
  "/create-banner",
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      if (req.file) {
        req.body.bannerImage = req.file.filename;
      } else {
        req.body.bannerImage = "";
        console.log("⚠ No file uploaded");
      }
      const banners = new bannersModel(req.body);
      await banners.save();

      // ✅ Create Notification after saving banner
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "New Banner Created",
        message: `The banner titled "${banners.bannerTitle || "Untitled"}" has been created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "success", // optional: success/info/warning/error
      });

      await notification.save();

      res.json({ message: "Banner added successfully", banners });
    } catch (error) {
      console.error("❌ Error adding banner:", error);
      res
        .status(400)
        .json({ message: "Error adding banner", error: error.message });
    }
  }
);



BannerRoute.get("/banner", async (req, res) => {
  try {
    // Fetch banner data from DB (example)
    const banner = await bannersModel.findOne(); // or .findOne(), depending on your schema

    if (!banner || banner.length === 0) {
      return res.status(404).json({ error: "No banner data found" });
    }

    res.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

BannerRoute.get("/banners", async (req, res) => {
  try {
    const banners = await bannersModel.find();

    if (!banners || banners.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No banners found" });
    }

    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Error in /banners route:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

BannerRoute.get("/count-banners", async (req, res) => {
  try {
    const banners = await bannersModel.find();

    if (!banners || banners.length === 0) {
      return res
        .status(404)
        .json({ message: "No banners found", count: 0, banners: [] });
    }

    res.json({ count: banners.length, banners });
  } catch (error) {
    console.error("Error fetching banners count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});



BannerRoute.get("/search-banners", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.query;

    const banner = await bannersModel.findOne(searchCriteria);
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

module.exports = BannerRoute;