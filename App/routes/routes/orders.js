// const express = require("express");
// const OrderRoute = express.Router();
// const OrderModel = require("../../models/orders");
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


// OrderRoute.post("/create-order", async (req, res) => {
//   try {
//     // Generate custom orderId like ORD12345
//     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
//     const customOrderId = `ORD${randomNum}`;

//     const order = new OrderModel({
//       ...req.body,
//       orderId: customOrderId,
//     });

//     await order.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Order Created",
//       message: `The order titled "${order.orderId}" has been created successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "success", // optional: success/info/warning/error
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


// OrderRoute.get("/one-order",async (req, res) => {
//   try {
//     const order = req.body;
//     if(!order)
//     {
//       res.send("order does not exist")
//     }
//     res.send(order);
//   } catch (error) {
//     res.status(400).send("order does not exist");
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


// OrderRoute.get("/search-order",async(req,res)=>
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
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth");
const { isValidObjectId } = require("../../utils/validation");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");


// OrderRoute.post("/create-order", async (req, res) => {
//   try {
//     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
//     const customOrderId = `ORD${randomNum}`;

//     const order = new OrderModel({
//       ...req.body,
//       orderId: customOrderId,
//     });

//     await order.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       customerId: order.customerId,
//       notificationTitle: "Order placed",
//       message: `Hello ${order.customerName}, your order has been placed successfully. Your Order ID is ${order.orderId}.`,
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

// ✅ Update Order Status

OrderRoute.post("/create-order", async (req, res) => {
  try {
    // Generate unique orderId
    let customOrderId;
    let exists = true;
    while (exists) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      customOrderId = `ORD${randomNum}`;
      exists = await OrderModel.findOne({ orderId: customOrderId });
    }

    const order = new OrderModel({
      ...req.body,
      orderId: customOrderId,
    });

    await order.save();

    // Create notification
    const now = moment();
    const notification = new notificationsModel({
      customerId: order.customerId,
      notificationTitle: "Order placed",
      message: `Hello ${order.customerName}, your order has been placed successfully. Your Order ID is ${order.orderId}.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    });

    await notification.save();

    res.json({ message: "Order added successfully", order });
  } catch (error) {
    console.error("Error adding the order:", error);
    res.status(400).json({ message: "Error adding the order", error });
  }
});

OrderRoute.put("/status-update", async (req, res) => {
  try {
    const { customerId, orderId, orderStatus } = req.body;

    if (!customerId || !orderId || !orderStatus) {
      return res.status(400).json({
        error: "customerid, orderId, and orderStatus are required",
      });
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { customerId, _id: orderId },
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found for this customer" });
    }

    const now = moment();
    const notification = new notificationsModel({
      customerId: updatedOrder.customerId,
      notificationTitle: "Order Status Updated",
      message: ` Order #${orderId} for ${updatedOrder.customerName} is now "${orderStatus}".`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    });

    await notification.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});


OrderRoute.delete("/delete-order/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const deletedProduct = await OrderModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Order not found" });
    }

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Order Deleted",
      message: ` The order titled "${deletedProduct.orderId}" has been deleted successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "warning", // 'warning' or 'info' fits better for delete
    });

    await notification.save();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Error deleting the order" });
  }
});


OrderRoute.get("/one-order", async (req, res) => {
  try {
    const order = req.body;
    if (!order) {
      res.send("order does not exist")
    }
    res.send(order);
  } catch (error) {
    res.status(400).send("order does not exist");
  }
});

OrderRoute.get("/all-orders", async (req, res) => {
  try {
    const order = await OrderModel.find();
    if (!order) {
      throw new error("orders are not found");
    }
    res.send(order);
  } catch (error) {
    res.status(400).send("orders are not found");
  }
});

OrderRoute.get("/count-orders", async (req, res) => {
  try {
    const orders = await OrderModel.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found", count: 0, product: [] });
    }

    res.json({ count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching orders count:", error);
    res.status(400).json({ message: "Bad request" });
  }
});


OrderRoute.post("/orders-data", async (req, res) => {
  const { customerId } = req.body;

  try {
    const userCart = await OrderModel.find({ customerId });
    res.status(200).json({ success: true, response: userCart });
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ success: false, message: "Error fetching cart data" });
  }
});


OrderRoute.get("/search-order", async (req, res) => {
  try {
    const findOrder = await OrderModel.findOne(req.body);
    res.send(findOrder)
  } catch (error) {
    res.status(500).json({ error: "product not found" });
  }
})


module.exports = OrderRoute;