// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   orderId: {
//     type: String,
//     required: true
//   },
//   customerName: {
//     type: String,
//     required: true,
//     minLength: 4,
//     maxLength: 50
//   },
//   mobile:
//   {
//   type: String,
//   },
//   address: {
//     type: String,
//     required: true
//   },
//   state: {
//     type: String,
//     required: true
//   },
//   city: {
//     type: String,
//     required: true
//   },
//   pincode:
//   {
//          type: String,
//     required: true
//   },
//   products: [
//     {
//       name: { type: String, required: true },
//       variant: { type: String, required: true },
//       quantity: { type: Number, required: true, min: 1 },
//       price:{type: String, required: true}
//     }
//   ],
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   orderStatus: {
//     type: String,
//     enum: [ "Processing", "Delivered"],
//     default:"Processing"
//   },
//   orderDate: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// const orderModel = mongoose.model("orders", OrderSchema);
// module.exports = orderModel;

// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       required: true,
//     },
//     customerId: {
//       type: String,
//       required: true,
//     },
//     customerName: {
//       type: String,
//       required: true,
//       minLength: 4,
//       maxLength: 50,
//     },
//     mobile: { type: String },
//     address: {
//       type: String,
//       required: true,
//     },
//     state: {
//       type: String,
//       required: true,
//     },
//     city: {
//       type: String,
//       required: true,
//     },
//     pincode: {
//       type: String,
//       required: true,
//     },
//     products: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
//         name: { type: String, required: true },
//         variant: { type: String, required: true },
//         quantity: { type: Number, required: true, min: 1 },
//         price: { type: String, required: true },
//       },
//     ],
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     orderStatus: {
//       type: String,
//       enum: ["Processing", "Delivered", "Cancelled"],
//       default: "Processing",
//     },
//     orderDate: {
//       type: Date,
//       default: Date.now,
//     },
//     // **NEW FIELD ADDED HERE**
//     isStockDeducted: {
//       type: Boolean,
//       default: false, // Default to false for new orders
//     },
//   },
//   { timestamps: true }
// );

// const orderModel = mongoose.model("orders", OrderSchema);
// module.exports = orderModel;


const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    customerId: { // Keep as is from your request
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    customerName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    mobileNumber: {
    type: String,
    required: true,
  },
    address: {
      type: String,
      required: true,
    },

    discountedAmount: {       // total after coupon
    type: Number,
    default: null
  },
  couponApplied: {          // coupon code if applied
    type: String,
    default: null
  },
    state: { // Added from the top modal
      type: String,
    
    },
    city: { // Added from the top modal
      type: String,

    },
    pincode: { // Added from the top modal
      type: String,
    
    },
    products: {
      type: [
        {
          id: { type: String, required: true },
          name: String,
          quantity: Number,
          price: Number,
          productName: String,
          description: String,
          margin: Number,
          category: String,
          brand: String,
          unit: String,
          size: String,
          material: String,
          color: String,
          age: String,
          images: mongoose.Schema.Types.Mixed,
          customerid: String,
          customerName: String,
        },
      ],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [, "Processing","Delivered", "Cancelled"],
      default: "Processing",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    isStockDeducted: { // Added from the top modal
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", OrderSchema);
module.exports = orderModel;