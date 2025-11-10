// const mongoose = require("mongoose");
// const cartSchema = new mongoose.Schema(
//   {
//     productName: {
//       type: String,

//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     price: {
//       type: Number,

//     },
//     margin: {
//       type: Number,
//       default: 0,
//     },
//     category: {
//       type: String,

//     },
//     brand: {
//       type: String,

//     },

//     metaTitle: {
//       type: String,
//       trim: true,
//     },
//     metaKeyword: {
//       type: String,
//       trim: true,
//     },
//     metaDescription: {
//       type: String,
//       trim: true,
//     },
//     unit: {
//       type: String,

//     },
//     size: {
//       type: String,
//       enum: ["S", "M", "L", "XL"],

//     },
//     discount: {
//       type: Number,
//       default: 0,
//     },
//     stock: {
//       type: Number,
//     },
//     material: {
//       type: String,

//     },
//     color: {
//       type: String,

//     },
//     age: {
//       type: String,

//     },
//     quantity: {
//       type: String,

//     },
//     reviews: [
//       {
//         type: String,
//       },
//     ],
//     images: {
//       type: String, // URL or file path to image

//     },
//   },
//   {
//     Timestamp: true,
//   }
// );
// module.exports = mongoose.model("Cart", cartSchema);

// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     customerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Assuming you have a User model
//       required: true,
//     },
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product", // Assuming you have a Product model
//       required: true,
//     },
//     productName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: String,
//     },
//     brand: {
//       type: String,
//     },
//     variants: {
//       unit: String,
//       size: String,
//       discount: Number,
//       stock: Number,
//       material: String,
//       color: String,
//       age: String,
//     },
//     quantity: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//     reviews: {
//       type: Number,
//       default: 0,
//     },
//     images: {
//       type: [String], // Array of image URLs
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // Add this line to create a compound unique index on customerId and productId
// cartSchema.index({ customerId: 1, productId: 1 }, { unique: true });

// module.exports = mongoose.model("Cart", cartSchema);

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "customers", // Assuming you have a User model
      required: true,
    },
    productId: {
      type:mongoose.Schema.Types.Mixed,
      ref: "Product", // Assuming you have a Product model
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
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
    },
    brand: {
      type: String,
    },

    unit: { type: String, required: true },
    size: {
      type: String,
    },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    material: { type: String, required: true },
    color: { type: String, required: true },
    age: { type: String, required: true },
    total:
    {
      type: String,
    },
    quantity: {
      type: Number || String,
      default: 1,
      min: 1,
    },
    reviews: {
      type: Number || String,
      default: 0,
    },
    images: {
      type: [String], // Array of image URLs
      // required: true,
    },
  },
  { timestamps: true }
);

// Add this line to create a compound unique index on customerId and productId
cartSchema.index({ customerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
