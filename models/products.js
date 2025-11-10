const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
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
      type: [String],
      default: [],
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    shortId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // Flattened product attributes
    unit: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "One Size", ""],
      default: "",
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    material: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    age: {
      type: String,
      trim: true,
    },

    // Images (plural, in case multiple are uploaded)
    images: [
      {
        type: String, // filename or URL
      },
    ],
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
