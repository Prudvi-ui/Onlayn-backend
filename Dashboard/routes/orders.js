// const express = require("express");
// const OrderRoute = express.Router();
// const OrderModel = require("../../models/orders");
// const ProductModel = require("../../models/products");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const { json } = require("body-parser");
// const fs = require("fs");
// const { error } = require("console");
// const { userAuth } = require("../../middlewares/userAuth");
// const {isValidObjectId} = require("../../utils/validation");
// const mongoose = require("mongoose");
// const notificationsModel = require("../../models/notifications");

// const moment = require("moment-timezone");


// OrderRoute.post("/create-order", userAuth, async (req, res) => {
//   try {
//     // Generate custom orderId like ORD12345
//     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
//     const customOrderId = `ORD${randomNum}`;

//     const { products: reqProducts, ...otherOrderFields } = req.body;

//     if (!reqProducts || !Array.isArray(reqProducts) || reqProducts.length === 0) {
//       return res.status(400).json({ message: "Products array is required and cannot be empty" });
//     }

//     // Build normalized products array for the order
//     const orderProducts = [];

//     for (const p of reqProducts) {
//       if (!p.productId || !p.variantId || !p.quantity) {
//         return res.status(400).json({ message: "Each product must have productId, variantId, and quantity" });
//       }

//       // Fetch product document
//       const productDoc = await ProductModel.findById(p.productId);
//       if (!productDoc) {
//         return res.status(404).json({ message: `Product not found: ${p.productId}` });
//       }

//       // Find variant by _id inside variants array
//       const variantDoc = productDoc.variants.id(p.variantId);
//       if (!variantDoc) {
//         return res.status(404).json({ message: `Variant not found: ${p.variantId} in product ${p.productId}` });
//       }

//       orderProducts.push({
//         productId: productDoc._id,
//         variantId: variantDoc._id,
//         name: productDoc.productName,
//         variant: variantDoc.size || variantDoc.unit || 'Default',
//         quantity: p.quantity,
//         price: productDoc.price
//       });
//     }

//     // Create order document with normalized products
//     const order = new OrderModel({
//       ...otherOrderFields,
//       orderId: customOrderId,
//       products: orderProducts
//     });

//     await order.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Order Created",
//       message: `The order titled "${order.orderId}" has been created successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "success",
//     });

//     await notification.save();

//     res.json({ message: "Order added successfully", order });

//   } catch (error) {
//     console.error("Error adding the order:", error);
//     res.status(400).json({ message: "Error adding the order", error });
//   }
// });


// OrderRoute.delete("/delete-order/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Ensure `id` is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid order ID" });
//     }

//     const deletedProduct = await OrderModel.findByIdAndDelete(id);

//     if (!deletedProduct) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Order Deleted",
//       message: `The order titled "${deletedProduct.orderId}" has been deleted successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "warning", // 'warning' or 'info' fits better for delete
//     });

//     await notification.save();

//     res.json({ message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     res.status(500).json({ error: "Error deleting the order" });
//   }
// });


// OrderRoute.get("/one-order/:id", async (req, res) => {
//   try {
//     const order = await OrderModel.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Manually fetch product image using product name
//     const productsWithImages = await Promise.all(order.products.map(async (item) => {
//       const product = await ProductModel.findOne({ productName: item.name });
//       return {
//         ...item.toObject(),
//         image: product?.images?.[0] || null
//       };
//     }));

//     const orderWithImages = {
//       ...order.toObject(),
//       products: productsWithImages
//     };

//     res.json(orderWithImages);
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({ message: "Error fetching order" });
//   }
// });

// OrderRoute.get("/all-orders",async (req, res) => {
//   try {
//     const order = await OrderModel.find();
//     if (!order) {
//       throw new error("orders are not found");
//     }
//     res.send(order);
//   } catch (error) {
//     res.status(400).send("orders are not found");
//   }
// });

// OrderRoute.get("/count-orders",async (req, res) => {
//   try {
//     const orders = await OrderModel.find();

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found", count: 0, product: [] });
//     }

//     res.json({ count: orders.length, orders });
//   } catch (error) {
//     console.error("Error fetching orders count:", error);
//     res.status(400).json({ message: "Bad request" });
//   }
// });


// // OrderRoute.patch(
// //     "/update-order",
// //     async (req, res) => {
// //       try {
// //         const orderId = req.body._id;

// //         console.log("Received update request for product ID:", orderId);
// //         console.log("Request body:", req.body);
// //         console.log("Uploaded file:", req.file);

// //         if (!orderId) {
// //           return res.status(400).json({ error: "product ID is required for updating" });
// //         }

// //         if (!isValidObjectId(orderId)) {
// //           return res.status(400).json({ error: "Invalid ID format" });
// //         }

// //         let order = await OrderModel.findById(orderId);
// //         if (!order) {
// //           return res.status(404).json({ error: "product not found" });
// //         }

// //         // ✅ Update all fields if present in body
// //         const fieldsToUpdate = [
// //           "deliveryAddress",
// //           "paymentStatus"
// //         ];

// //         fieldsToUpdate.forEach((field) => {
// //           if (req.body[field] !== undefined) {
// //             order[field] = req.body[field];
// //           }
// //         });

// //         await order.save();

// //         return res.json({
// //           message: "Product updated successfully",
// //           order,
// //         });

// //       } catch (error) {
// //         console.error("Error updating product:", error);
// //         return res.status(500).json({ error: "Something went wrong" });
// //       }
// //     }
// //   );


// OrderRoute.get("/search-order",userAuth,async(req,res)=>
// {
//   try {
//     const findOrder = await OrderModel.findOne(req.body);
//   res.send(findOrder)
// } catch (error) {
//   res.status(500).json({ error: "product not found" });
// }
// })


// module.exports = OrderRoute;

const express = require("express");
const OrderRoute = express.Router();
const OrderModel = require("../../models/orders");
const ProductModel = require("../../models/products");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");
const moment = require("moment-timezone");
const { userAuth } = require("../../middlewares/userAuth");
const { isValidObjectId } = require("../../utils/validation");
const orderModel = require("../../models/orders");

/**
 * @route POST /create-order
 * @description Creates a new order. Variants have been removed from the logic.
 * @access Private (User)
 */
// OrderRoute.post("/create-order", userAuth, async (req, res) => {
//   try {
//     // Generate a custom orderId like ORD12345
//     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
//     const customOrderId = `ORD${randomNum}`;

//     const { products: reqProducts, ...otherOrderFields } = req.body;

//     // Validate that the products array is present and not empty
//     if (!reqProducts || !Array.isArray(reqProducts) || reqProducts.length === 0) {
//       return res.status(400).json({ message: "Products array is required and cannot be empty" });
//     }

//     // Build a normalized products array for the order
//     const orderProducts = [];

//     for (const p of reqProducts) {
//       // Validate that each product has a productId and quantity
//       if (!p.productId || !p.quantity) {
//         return res.status(400).json({ message: "Each product must have a productId and quantity" });
//       }

//       // Fetch product document to get name and price
//       const productDoc = await ProductModel.findById(p.productId);
//       if (!productDoc) {
//         return res.status(404).json({ message: `Product not found: ${p.productId}` });
//       }

//       // Push the simplified product details to the array
//       orderProducts.push({
//         productId: productDoc._id,
//         name: productDoc.productName,
//         quantity: p.quantity,
//         price: productDoc.price,
//         image: productDoc.images?.[0] || null
//       });
//     }

//     // Create the new order document
//     const order = new OrderModel({
//       ...otherOrderFields,
//       orderId: customOrderId,
//       products: orderProducts
//     });

//     await order.save();

//     // Create a notification for the order creation
//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Order Created",
//       message: `The order titled "${order.orderId}" has been created successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       type: "success",
//     });

//     await notification.save();

//     res.status(201).json({ message: "Order added successfully", order });

//   } catch (error) {
//     console.error("Error adding the order:", error);
//     res.status(500).json({ message: "Error adding the order", error });
//   }
// });


// OrderRoute.post("/create-order", userAuth, async (req, res) => {
//   try {
//     // Generate a custom orderId like ORD12345
//     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
//     const customOrderId = `ORD${randomNum}`;

//     const { products: reqProducts, ...otherOrderFields } = req.body;

//     // Validate that the products array is present and not empty
//     if (!reqProducts || !Array.isArray(reqProducts) || reqProducts.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Products array is required and cannot be empty" });
//     }

//     // Build a normalized products array for the order
//     const orderProducts = [];
//     for (const p of reqProducts) {
//       if (!p.productId || !p.quantity) {
//         return res
//           .status(400)
//           .json({ message: "Each product must have a productId and quantity" });
//       }

//       const productDoc = await ProductModel.findById(p.productId);
//       if (!productDoc) {
//         return res
//           .status(404)
//           .json({ message: `Product not found: ${p.productId}` });
//       }

//       orderProducts.push({
//         productId: productDoc._id,
//         name: productDoc.productName,
//         quantity: p.quantity,
//         price: productDoc.price,
//         image: productDoc.images?.[0] || null,
//       });
//     }

//     // Create the new order document
//     const order = new OrderModel({
//       ...otherOrderFields,
//       orderId: customOrderId,
//       products: orderProducts,
//       customerId: req.customer._id, // ✅ Save customerId in the order itself
//     });

//     await order.save();

//     // Create a notification for the order creation
//     const now = moment().tz("Asia/Kolkata");
//     const notification = new notificationsModel({
//       notificationTitle: "Order Created",
//       message: `The order titled "${order.orderId}" has been created successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("hh:mm A"),
//       type: "success",
//       customerId: req.customer._id, // ✅ Link notification to the customer
//     });

//     await notification.save();

//     // ✅ Strip sensitive/internal fields before sending to frontend
//     const safeOrder = {
//       _id: order._id,
//       orderId: order.orderId,
//       products: order.products,
//       status: order.status,
//       totalAmount: order.totalAmount,
//       createdAt: order.createdAt,
//     };

//     res.status(201).json({
//       message: "Order added successfully",
//       order: safeOrder,
//     });
//   } catch (error) {
//     console.error("Error adding the order:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding the order", error: error.message });
//   }
// });




OrderRoute.put("/status-update", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id.toString(); // from token
    const { orderId, orderStatus } = req.body;

    // 1. Validate input
    if (!orderId || !orderStatus) {
      return res.status(400).json({
        error: "orderId and orderStatus are required",
      });
    }

    // 2. Find and update the order
    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, customerId }, // match order by _id + customer ownership
      { orderStatus },              // update status
      { new: true }                 // return updated doc
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: "Order not found or you are not authorized to update it",
      });
    }

    // 3. Create notification safely
    const now = moment();
    const notificationData = {
      notificationTitle: "Order Status Updated",
      message: `Order #${updatedOrder._id} for ${updatedOrder.customerName} is now "${orderStatus}".`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    };

    // Only add productId if order has products
    if (updatedOrder.products && updatedOrder.products.length > 0) {
      notificationData.productId = updatedOrder.products[0].id; // optional: first product
    }

    const notification = new notificationsModel(notificationData);
    await notification.save();

    // 4. Send response
    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

OrderRoute.post("/create-order", userAuth, async (req, res) => {
  try {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const customOrderId = `ORD${randomNum}`;

    const {
      customerId,
      // customerName,
      mobileNumber,
      address,
      state,
      city,
      pincode,
      products,
      totalAmount,
      discountedAmount,   // <--- add this
      couponApplied,      // <--- add this
    } = req.body;

    const customerName = `${req.customer.firstName || ""} ${req.customer.lastName || ""}`.trim();
    const mappedProducts = products.map((p) => ({
      id: p.productId,
      name: p.name || p.productName,
      quantity: Number(p.quantity),
      price: Number(p.price),
      productName: p.productName,
      description: p.description || "",
      margin: p.margin || 0,
      category: p.category || "",
      brand: p.brand || "",
      unit: p.unit || "",
      size: p.size || "",
      material: p.material || "",
      color: p.color || "",
      age: p.age || "",
      images: p.images || [],
      customerid: customerId,
      customerName,
      mobileNumber,
    }));

    const order = new OrderModel({
      orderId: customOrderId,
      customerId,
      customerName,
      mobileNumber,
      address,
      state,
      city,
      pincode,
      products: mappedProducts,
      totalAmount: Number(totalAmount),
      discountedAmount: discountedAmount ?? null, // <--- set it here
      couponApplied: couponApplied || null,       // <--- set it here
    });

    await order.save();

    // Save notification
    const now = moment();
    const notification = new notificationsModel({
      customerId: customerId,
      notificationTitle: "Order Created",
      message: `The order "${order.orderId}" has been created successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    });

    await notification.save();

    res.status(201).json({
      message: "Order added successfully",
      order,
    });
  } catch (error) {
    console.error("Error adding the order:", error);
    res.status(400).json({
      message: "Error adding the order",
      error: error.message || error,
    });
  }
});

/**
 * @route DELETE /delete-order/:id
 * @description Deletes an order by ID.
 * @access Public
 */
OrderRoute.delete("/delete-order/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Order Deleted",
      message: `The order titled "${deletedOrder.orderId}" has been deleted successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      type: "warning",
    });

    await notification.save();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Error deleting the order" });
  }
});

/**
 * @route GET /one-order/:id
 * @description Fetches a single order by ID. Variants are no longer part of the response.
 * @access Public
 */
// OrderRoute.get("/one-order/:id", async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: "Invalid order ID format" });
//     }

//     const order = await OrderModel.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.json(order);
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({ message: "Error fetching order" });
//   }
// });

OrderRoute.get("/one-order/:id", async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Manually fetch product image using product name
    const productsWithImages = await Promise.all(order.products.map(async (item) => {
      const product = await ProductModel.findOne({ productName: item.name });
      return {
        ...item.toObject(),
        image: product?.images?.[0] || null
      };
    }));

    const orderWithImages = {
      ...order.toObject(),
      products: productsWithImages
    };

    res.json(orderWithImages);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

/**
 * @route GET /all-orders
 * @description Fetches all orders.
 * @access Public
 */
// OrderRoute.get("/all-orders", async (req, res) => {
//   try {
//     const orders = await OrderModel.find();
//     if (!orders) {
//       return res.status(404).json({ message: "No orders found" });
//     }
//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching all orders:", error);
//     res.status(500).json({ message: "Error fetching all orders" });
//   }
// });

OrderRoute.get("/all-orders", async (req, res) => {
  try {
    // 1. Get the list of already-processed order IDs from the query parameters.
    // The frontend should send them as a comma-separated string, e.g., ?processedIds=id1,id2,id3
    const processedIdsString = req.query.processedIds;

    // 2. Initialize the query object.
    const query = {};

    // 3. If there are processed IDs, split the string into an array and add a condition to the query.
    if (processedIdsString) {
      const processedIdsArray = processedIdsString.split(',');
      // The `$nin` operator finds documents where the `_id` is "not in" the provided array.
      query._id = { $nin: processedIdsArray };
      console.log("Fetching new orders, excluding:", processedIdsArray);
    }

    // 4. Fetch orders from the database using the constructed query.
    // If no processed IDs were sent, this will return all orders (the original behavior).
    // If processed IDs were sent, it will only return the new, unprocessed ones.
    const orders = await OrderModel.find(query);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No new orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching new orders:", error);
    res.status(500).json({ message: "Error fetching new orders" });
  }
});


/**
 * @route GET /count-orders
 * @description Fetches the count of all orders.
 * @access Public
 */
OrderRoute.get("/count-orders", async (req, res) => {
  try {
    const orderCount = await OrderModel.countDocuments();
    res.json({ count: orderCount });
  } catch (error) {
    console.error("Error fetching orders count:", error);
    res.status(500).json({ message: "Error fetching orders count" });
  }
});

/**
 * @route PATCH /update-order
 * @description Updates an order's payment status or delivery address by ID.
 * @access Public
 */
OrderRoute.patch("/update-order", async (req, res) => {
  try {
    const orderId = req.body._id;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required for updating" });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    let order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update fields if they are present in the request body
    const fieldsToUpdate = [
      "deliveryAddress",
      "paymentStatus"
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    await order.save();

    return res.json({
      message: "Order updated successfully",
      order,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * @route GET /search-order
 * @description Searches for an order by `orderId`.
 * @access Private (User)
 */
OrderRoute.get("/search-order", userAuth, async (req, res) => {
  try {
    const { orderId } = req.query; // Use query parameter for safe search

    if (!orderId) {
      return res.status(400).json({ message: "Please provide an orderId to search" });
    }

    const foundOrder = await OrderModel.findOne({ orderId });

    if (!foundOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(foundOrder);
  } catch (error) {
    console.error("Error searching for order:", error);
    res.status(500).json({ error: "Error searching for the order" });
  }
});

OrderRoute.put("/mark-stock-deducted/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { isStockDeducted: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order marked as stock deducted", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order" });
  }
});

OrderRoute.get("/orders-data", userAuth, async (req, res) => {
  try {
    // customerId from token
    const customerId = req.customer._id.toString();

    const orders = await OrderModel.find({ customerId });

    res.status(200).json({
      success: true,
      items: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});

module.exports = OrderRoute;
