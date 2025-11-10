// models/delivery.js

const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true,
      unique: true,
    },
    // Corrected field name to match frontend convention and type for proper database referencing
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers", // Assuming your customer model is named 'users'
      required: true,
    },
    // Corrected field name and type
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Assuming your agent model is named 'users'
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Delivered", "Cancelled"],
      default: "Processing",
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    deliveryAgent: {
      type: String,
      default: "",
    },
    estimatedDate: {
      type: String,
    },
  },
  { timestamps: true }
);

const deliveryModel = mongoose.model("delivery", DeliverySchema);
module.exports = deliveryModel;