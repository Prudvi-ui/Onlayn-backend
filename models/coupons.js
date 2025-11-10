const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      minLength: 4,
      maxLength: 50,
      trim: true,
    },
    usageLimit: {
      type: String, // assuming a limit like 10 uses
    },
    minPurchase: {
      type: String, // assuming a price like 100 or 500
    },
    discountType: {
      type: String, // e.g., 'percentage' or 'flat'
      enum: ['percentage', 'flat'],
    },
    discountValue: {
      type: String, // e.g., 10 for 10% or 50 flat
    },
    maxDiscount: {
      type: String, // for max cap on percentage discount
    },
    startDate: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
  },
  { timestamps: true }
);

const couponModel = mongoose.model("coupons", couponSchema);
module.exports = couponModel;
