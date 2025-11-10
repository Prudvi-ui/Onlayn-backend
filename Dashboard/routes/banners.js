const express = require("express");
const BannerRoute = express.Router();
const bannersModel = require("../../models/banners");
const productModel = require("../../models/products"); // 👈 Adjusted path: assuming 'product.js'
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
    callback(null, storagePath);
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
  adminAuth,
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      if (req.file) {
        req.body.bannerImage = req.file.filename;
      } else {
        req.body.bannerImage = "";
        console.log("⚠️ No file uploaded");
      }

      const newBannerData = {
        ...req.body,
        products: req.body.products ? JSON.parse(req.body.products) : [],
      };

      const banners = new bannersModel(newBannerData);
      await banners.save();

      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "New Banner Created",
        message: `The banner titled "${banners.bannerTitle || "Untitled"}" has been created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
        type: "success",
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

BannerRoute.delete("/delete-banner/:id", adminAuth, async (req, res) => {
  const _id = req.params.id;
  console.log("Delete request received for ID:", _id);
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid banner ID" });
  }

  const deletedBanner = await bannersModel.findByIdAndDelete(_id);

  if (!deletedBanner) {
    return res.status(404).json({ error: "Banner not found" });
  }

  const now = moment();
  const notification = new notificationsModel({
    notificationTitle: "Banner Deleted",
    message: `The banner titled "${deletedBanner.bannerTitle || "Untitled"}" was deleted.`,
    date: now.format("YYYY-MM-DD"),
    time: now.format("h:mm A"),
    source:"dashboard",
    type: "warning",
  });

  await notification.save();

  res.json({ message: "Banner deleted successfully" });
});

BannerRoute.get("/banner", async (req, res) => {
  try {
    const banner = await bannersModel.findOne();

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
    // ❌ Removed the .populate() method.
    // Mongoose will now only return the banner data, including the
    // ObjectId and productName stored in the products array.
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
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});

BannerRoute.put(
  "/update-banners",
  adminAuth,
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      const bannersId = req.body.banner_id;

      let banners = await bannersModel.findById(bannersId);
      if (!banners) {
        return res.status(404).json({ error: "banners not found" });
      }

      if (req.body.bannerTitle) {
        banners.bannerTitle = req.body.bannerTitle;
      }

      if (req.body.products) {
        banners.products = JSON.parse(req.body.products);
      }

      if (req.file) {
        banners.bannerImage = req.file.filename;
      }

      await banners.save();

      const now = moment();
      const newNotification = new notificationsModel({
        notificationTitle: "Banner Updated",
        message: `The banner titled "${banners.bannerTitle || bannersId}" has been successfully updated.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
      });

      await newNotification.save();

      return res.json({
        message: "banners updated successfully",
        banners,
      });
    } catch (error) {
      console.error("Error updating banners:", error);
      return res.status(500).json({ error: error.message || "Something went wrong" });
    }
  }
);


BannerRoute.get("/search-banners", async (req, res) => {
  try {
    const searchCriteria = req.query;

    const banner = await bannersModel.findOne(searchCriteria);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = BannerRoute;