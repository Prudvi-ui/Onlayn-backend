const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    notificationTitle: {
      type: String,
      minLength: 4,
      maxLength: 50,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId|| String,
      ref: "customers",
    },

    date: {
      type: String, // Consider changing to Date type if you want full date object functionality
    },
    message: {
      type: String,
    },
    time: {
      type: String,
      required: true, // ✅ required so you always send it manually
    },
    read: {
      // <--- THIS IS THE MISSING FIELD
      type: Boolean,
      default: false, // Notifications are unread by default
    },
    userId: {
      // Assuming notifications can be user-specific
      type: String, // If this refers to a Mongoose ObjectId, change to mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    source: {
      type: String,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  },
  { timestamps: true } // This adds createdAt and updatedAt
);

const NotificationModel = mongoose.model("notifications", NotificationSchema);
module.exports = NotificationModel;
