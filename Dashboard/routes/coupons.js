const express = require("express");
const CouponRoute = express.Router();
const couponsModel = require("../../models/coupons");
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



CouponRoute.post(
  "/create-coupon",
  adminAuth,
  async (req, res) => {
    try {
    
      const coupons = new couponsModel(req.body);
      await coupons.save();

      // ✅ Create Notification after saving banner
      const now = moment();
      const notification = new notificationsModel({
        notificationTitle: "New coupons Created",
        message: `The coupons titled "${coupons.couponCode || "Untitled"}" has been created successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source:"dashboard",
        type: "success", // optional: success/info/warning/error
      });

      await notification.save();

      res.json({ message: "coupon added successfully", coupons });
    } catch (error) {
      console.error("❌ Error adding coupon:", error);
      res
        .status(400)
        .json({ message: "Error adding coupon", error: error.message });
    }
  }
);

CouponRoute.delete("/delete-coupon/:id", adminAuth, async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ error: "Invalid coupon ID" });
  }

  const deletedCoupon = await couponsModel.findByIdAndDelete(_id);

  if (!deletedCoupon) {
    return res.status(404).json({ error: "coupon not found" });
  }

  // ✅ Create a notification after deletion
  const now = moment();
  const notification = new notificationsModel({
    notificationTitle: "coupon Deleted",
    message: `The coupon titled "${deletedCoupon.couponCode || "Untitled"}" was deleted.`,
    date: now.format("YYYY-MM-DD"),
    time: now.format("h:mm A"),
    source:"dashboard",
    type: "warning", // optional: can be used for styling
  });

  await notification.save();

  res.json({ message: "coupons deleted successfully" });
});

CouponRoute.get("/coupon", async (req, res) => {
  try {
    // Fetch banner data from DB (example)
    const coupon = await couponsModel.findOne(); // or .findOne(), depending on your schema

    if (!coupon || coupon.length === 0) {
      return res.status(404).json({ error: "No coupon data found" });
    }

    res.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

CouponRoute.get("/coupons", async (req, res) => {
  try {
    const coupons = await couponsModel.find();

    if (!coupons || coupons.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No coupons found" });
    }

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error in /coupons route:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

CouponRoute.get("/count-coupons", async (req, res) => {
  try {
    const coupons = await couponsModel.find();

    if (!coupons || coupons.length === 0) {
      return res
        .status(404)
        .json({ message: "No coupons found", count: 0, coupons: [] });
    }

    res.json({ count: coupons.length, coupons });
  } catch (error) {
    console.error("Error fetching coupons count:", error);
    // Return the exact error message and stack trace (optional)
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
});

CouponRoute.put("/update-coupons", adminAuth, async (req, res) => {
  try {
    // Use coupon_id from request body instead of _id
    const couponsId = req.body.coupon_id;

    console.log("Received update request for coupons ID:", couponsId);
    console.log("Request body:", req.body);

    if (!couponsId) {
      return res.status(400).json({ error: "Coupon ID is required for updating" });
    }

    if (!isValidObjectId(couponsId)) {
      return res.status(400).json({ error: "Invalid coupon ID format" });
    }

    let coupon = await couponsModel.findById(couponsId);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Update all fields except _id and coupon_id
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key) && key !== "_id" && key !== "coupon_id") {
        coupon[key] = req.body[key];
      }
    }

    await coupon.save();

    const now = moment();

    // Create a notification about coupon update
    const newNotification = new notificationsModel({
      notificationTitle: "Coupon Updated",
      message: `The coupon "${coupon.couponCode || couponsId}" has been successfully updated.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
    });

    await newNotification.save();

    return res.json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({ error: error.message || "Something went wrong" });
  }
});


CouponRoute.get("/search-coupons", async (req, res) => {
  try {
    // Use req.query instead of req.body for GET request parameters
    const searchCriteria = req.query;

    const brand = await couponsModel.findOne(searchCriteria);
    if (!brand) {
      // If no banner found, return 404 with exact message
      return res.status(404).json({ error: "brand not found" });
    }
    res.json(brand);
  } catch (error) {
    // Return exact error message for debugging
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = CouponRoute;
