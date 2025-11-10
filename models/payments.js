const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    products: [
      {
        name: { type: String, required: true },
        variant: { type: String }, // optional
        quantity: { type: Number, default: 1 },
      },
    ],
    paymentAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Pending",
    },
    paidAt: {
      type: Date,
      default: null, // Set only when payment is successful
    },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("payments", PaymentSchema);
module.exports = PaymentModel;
