const mongoose = require("mongoose");

const ComingsoonSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    margin: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
  
    metaTitle: {
      type: String,
      trim: true,
    },
    metaKeyword: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL"],
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
    },
    material: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    reviews: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String, // URL or file path to image
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Comingsoon = mongoose.model("Comingsoon", ComingsoonSchema);
module.exports = Comingsoon;

