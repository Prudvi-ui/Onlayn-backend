const express = require("express");
const PaymentRoute = express.Router();
const PaymentModel = require("../../models/payments");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth");
const {isValidObjectId} = require("../../utils/validation");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");


PaymentRoute.post("/create-payment", userAuth, async (req, res) => {
  try {
    // Generate custom orderId like ORD12345
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const customPaymentId = `ORD${randomNum}`;

    const payment = new PaymentModel({
      ...req.body,
      paymentId: customPaymentId,
    });

    await payment.save();

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Payment Created",
      message: `The order titled "${payment.paymentId}" has been created successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success", // optional: success/info/warning/error
    });

    await notification.save();

    res.json({ message: "payment added successfully", order });
  } catch (error) {
    console.error("Error adding the payment:", error);
    res.status(400).json({ message: "Error adding the payment", error });
  }
});



PaymentRoute.delete("/delete-payment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }

    const deletedProduct = await PaymentModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "payment not found" });
    }

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Payment Deleted",
      message: `The payment titled "${deletedProduct.paymentId}" has been deleted successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "warning", // 'warning' or 'info' fits better for delete
    });

    await notification.save();

    res.json({ message: "payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Error deleting the payment" });
  }
});


PaymentRoute.get("/one-payment",async (req, res) => {
  try {
    const order = req.body;
    if(!order)
    {
      res.send("payment does not exist")
    }
    res.send(order);
  } catch (error) {
    res.status(400).send("payment does not exist");
  }
});

PaymentRoute.get("/all-payments",async (req, res) => {
  try {
    const payment = await PaymentModel.find();
    if (!payment) {
      throw new error("payment are not found");
    }
    res.send(payment);
  } catch (error) {
    res.status(400).send("payment are not found");
  }
});


PaymentRoute.get("/search-payment",userAuth,async(req,res)=>
{
  try {
    const findOrder = await PaymentModel.findOne(req.body);
  res.send(findOrder)
} catch (error) {
  res.status(500).json({ error: "payment not found" });
}
})

  
module.exports = PaymentRoute;
