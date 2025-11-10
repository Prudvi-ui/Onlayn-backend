const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    // customerid: {
    //   type: String,
    //   trim: true,
    //   required: true,
    // },
    customerid: {
      type: mongoose.Schema.Types.ObjectId || String,
      ref: "customers",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId || String,
      ref: "Product",
      required: true,
    },
    
    productName: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
    },
    margin: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
    },
    brand: {
      type: String,
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
    
        unit: { type: String },
        size: {
          type: String,
          enum: ["S", "M", "L", "XL", "One Size"],
        },
        discount: { type: Number, default: 0 },
        stock: { type: Number,},
        material: { type: String, },
        color: { type: String, },
        age: { type: String,  },
    
    reviews: [{ type: String }],
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate products for the same user
wishlistSchema.index({ customerid: 1, productId: 1 }, { unique: true });

const wishlistModel = mongoose.model("Wishlist", wishlistSchema);
module.exports = wishlistModel;