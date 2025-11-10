const express = require("express");
const DeliveryRoute = express.Router();
const DeliveryModel = require("../../models/delivery"); // Your Delivery Mongoose Model
const OrderModel = require("../../models/orders"); // Assuming your Order model is here
const UserModel = require("../../models/Users"); // Assuming your User model is here (for agentId)
const CustomerModel = require("../../models/customers"); // Note: This might be redundant if all users are in UserModel
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth");
const { adminAuth } = require("../../middlewares/adminAuth");
const { isValidObjectId } = require("../../utils/validation"); // Corrected to use this utility
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");
const deliveryModel = require("../../models/delivery");

// --- CREATE DELIVERY ---
// DeliveryRoute.post("/create-delivery", adminAuth, async (req, res) => {
//   try {
//     const { orderId, agentId, orderStatus, address, state, city, pincode, deliveryAgent, estimatedDate, customerId } = req.body;

//     // 1. Server-side Validation for required fields
//     if (!orderId || !agentId || !address || !state || !city || !pincode || !deliveryAgent || !estimatedDate || !customerId) {
//       return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
//     }

//     // 2. Validate orderId, customerId and agentId are valid ObjectIds
//     if (!isValidObjectId(orderId)) {
//       return res.status(400).json({ success: false, message: 'Invalid Order ID format.' });
//     }
//     if (!isValidObjectId(agentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid Agent ID format.' });
//     }
//     if (!isValidObjectId(customerId)) {
//       return res.status(400).json({ success: false, message: 'Invalid Customer ID format.' });
//     }

//     // 3. Check if a delivery for this orderId already exists to prevent duplicates
//     const existingDelivery = await DeliveryModel.findOne({ orderId });
//     if (existingDelivery) {
//       return res.status(409).json({ success: false, message: 'Delivery for this order already exists. Please update instead.' });
//     }

//     // 4. Verify order, customer and agent existence (good practice)
//     const orderExists = await OrderModel.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({ success: false, message: 'Order not found for the provided Order ID.' });
//     }
//     const customerExists = await CustomerModel.findById(customerId);
//     if (!customerExists) {
//       return res.status(404).json({ success: false, message: 'Customer not found for the provided Customer ID.' });
//     }
//     // Fix: Using UserModel for consistency, assuming roles are stored there.
//     const agentExists = await UserModel.findById(agentId);
//     if (!agentExists || agentExists.role !== 'Delivery Agent') {
//       return res.status(404).json({ success: false, message: 'Delivery agent not found or does not have the "Delivery Agent" role.' });
//     }

//     const newDelivery = new DeliveryModel({
//       orderId, // This is the _id of the Order document
//       customerId, // New field to store the customer ID
//       agentId, // This is the _id of the User (deliveryAgent) document
//       orderStatus: orderStatus || 'Processing',
//       address,
//       state,
//       city,
//       pincode,
//       deliveryAgent: deliveryAgent,
//       estimatedDate,
//     });

//     await newDelivery.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Delivery Created",
//       message: `A new delivery for Order ID ${newDelivery.orderId} was created successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "warning",
//     });
//     await notification.save();

//     await OrderModel.findByIdAndUpdate(
//       orderId,
//       {
//         deliveryAgent: agentId,
//         estimatedDate: estimatedDate,
//         orderStatus: 'Processing'
//       },
//       { new: true }
//     );

//     res.status(201).json({ success: true, message: "Delivery created successfully", delivery: newDelivery });
//   } catch (error) {
//     console.error("Error creating the delivery:", error);
//     res.status(500).json({ success: false, message: "Server error during delivery creation.", error: error.message });
//   }
// });

DeliveryRoute.post("/create-delivery", adminAuth, async (req, res) => {
  try {
    const { orderId, agentId, orderStatus, address, state, city, pincode, deliveryAgent, estimatedDate, customerId } = req.body;

    // 1. Server-side Validation for required fields
    if (!orderId || !agentId || !address || !state || !city || !pincode || !deliveryAgent || !estimatedDate || !customerId) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    // 2. Validate orderId, customerId and agentId are valid ObjectIds
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid Order ID format.' });
    }
    if (!isValidObjectId(agentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Agent ID format.' });
    }
    if (!isValidObjectId(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID format.' });
    }

    // 3. Check if a delivery for this orderId already exists to prevent duplicates
    const existingDelivery = await DeliveryModel.findOne({ orderId });
    if (existingDelivery) {
      return res.status(409).json({ success: false, message: 'Delivery for this order already exists. Please update instead.' });
    }

    // 4. Verify order, customer and agent existence (good practice)
    // We are now storing the result of findById so we can access the human-readable orderId
    const orderExists = await OrderModel.findById(orderId);
    if (!orderExists) {
      return res.status(404).json({ success: false, message: 'Order not found for the provided Order ID.' });
    }
    const customerExists = await CustomerModel.findById(customerId);
    if (!customerExists) {
      return res.status(404).json({ success: false, message: 'Customer not found for the provided Customer ID.' });
    }
    // Fix: Using UserModel for consistency, assuming roles are stored there.
    const agentExists = await UserModel.findById(agentId);
    if (!agentExists || agentExists.role !== 'Delivery Agent') {
      return res.status(404).json({ success: false, message: 'Delivery agent not found or does not have the "Delivery Agent" role.' });
    }

    const newDelivery = new DeliveryModel({
      orderId, // This is the _id of the Order document
      customerId, // New field to store the customer ID
      agentId, // This is the _id of the User (deliveryAgent) document
      orderStatus: orderStatus || 'Processing',
      address,
      state,
      city,
      pincode,
      deliveryAgent: deliveryAgent,
      estimatedDate,
    });

    await newDelivery.save();

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Delivery Created",
      // FIX: Use the human-readable orderId from the found order document
      message: `A new delivery for Order ID ${orderExists.orderId} was created successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "warning",
    });
    await notification.save();

    await OrderModel.findByIdAndUpdate(
      orderId,
      {
        deliveryAgent: agentId,
        estimatedDate: estimatedDate,
        orderStatus: 'Processing'
      },
      { new: true }
    );

    res.status(201).json({ success: true, message: "Delivery created successfully", delivery: newDelivery });
  } catch (error) {
    console.error("Error creating the delivery:", error);
    res.status(500).json({ success: false, message: "Server error during delivery creation.", error: error.message });
  }
});

// --- DELETE DELIVERY ---
DeliveryRoute.delete("/delete-delivery/:id", adminAuth, async (req, res) => {
  try {
    const deliveryId = req.params.id;

    if (!isValidObjectId(deliveryId)) {
      return res.status(400).json({ error: "Invalid delivery ID" });
    }

    const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);

    if (!deletedDelivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    const now = moment();
    // Fix: Reference deletedDelivery instead of a non-existent newDelivery
    const notification = new notificationsModel({
      notificationTitle: "Delivery Deleted",
      message: `The delivery for order ID "${deletedDelivery.orderId}" was deleted successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "warning", // optional: can be used for styling
    });
    await notification.save();

    // Optional: Clean up delivery info from the associated Order document
    // Using $unset to remove the fields completely
    await OrderModel.findByIdAndUpdate(
      deletedDelivery.orderId,
      { $unset: { deliveryAgent: "", estimatedDate: "" } },
      { new: true }
    );

    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ error: "Error deleting the delivery" });
  }
});

// --- GET ALL DELIVERIES ---
// Fix: Added adminAuth middleware for security
// Add this new route to your DeliveryRoute.js file
// DeliveryRoute.js
DeliveryRoute.get("/monthly-orders", adminAuth, async (req, res) => {
   try {
    const deliveries = await DeliveryModel.find({})
      .populate('orderId')
      .populate('agentId', 'firstName lastName username');

    if (!deliveries || deliveries.length === 0) {
      // Return an object with an empty array
      return res.status(200).json({ deliveries: [] }); 
    }
    
    // Send the deliveries array wrapped in an object
    res.status(200).json({ deliveries });

  } catch (error) {
    console.error("Error fetching delivery data:", error);
    res.status(500).send("Server error fetching deliveries");
  }
});

// DeliveryRoute.js
DeliveryRoute.get("/all-deliveries",async (req, res) => {
  try {
    const deliveries = await DeliveryModel.find({})
      .populate('orderId')
      .populate('agentId', 'firstName lastName username');

    if (!deliveries || deliveries.length === 0) {
      // Return an empty array wrapped in an object
      return res.status(200).json({ deliveries: [] }); 
    }
    
    // Send the deliveries array wrapped in an object
    res.status(200).json({ deliveries });

  } catch (error) {
    console.error("Error fetching delivery data:", error);
    res.status(500).send("Server error fetching deliveries");
  }
});
// --- COUNT DELIVERIES ---
DeliveryRoute.get("/count-deliveries", async (req, res) => {
  try {
    const deliveries = await DeliveryModel.find();

    if (!deliveries || deliveries.length === 0) {
      return res.status(200).json({ message: "No deliveries found", count: 0, deliveries: [] });
    }

    res.json({ count: deliveries.length, deliveries });
  } catch (error) {
    console.error("Error fetching deliveries count:", error);
    res.status(500).json({ message: "Server error fetching deliveries count" });
  }
});

// --- UPDATE DELIVERY ---
// DeliveryRoute.put(
//   "/update-delivery/:deliveryId",
//   adminAuth,
//   async (req, res) => {
//     try {
//       const { deliveryId } = req.params;
//       const { agentId, deliveryAgent, estimatedDate, orderStatus, customerId } = req.body;

//       console.log("Received update request for Delivery ID (from params):", deliveryId);
//       console.log("Request body:", req.body);

//       // 1. Server-side Validation
//       if (!deliveryId) {
//         return res.status(400).json({ success: false, message: "Delivery ID is required for updating delivery." });
//       }
//       if (!isValidObjectId(deliveryId)) {
//         return res.status(400).json({ success: false, message: "Invalid Delivery ID format." });
//       }
//       if (!agentId || !deliveryAgent || !estimatedDate || !customerId) {
//         return res.status(400).json({ success: false, message: 'Agent ID, Delivery Agent name, Estimated Date, and Customer ID are required for update.' });
//       }
//       // if (!isValidObjectId(agentId)) {
//       //   return res.status(400).json({ success: false, message: 'Invalid Agent ID format.' });
//       // }
//       if (!isValidObjectId(customerId)) {
//         return res.status(400).json({ success: false, message: 'Invalid Customer ID format.' });
//       }

//       // Fix: Consistent model usage for agent validation
//       const agentExists = await UserModel.findById(agentId);
//       if (!agentExists || agentExists.role !== 'Delivery Agent') {
//         return res.status(404).json({ success: false, message: 'Delivery agent not found or does not have the "Delivery Agent" role.' });
//       }
//       // Fix: Added verification for customer existence
//       const customerExists = await CustomerModel.findById(customerId);
//       if (!customerExists) {
//         return res.status(404).json({ success: false, message: 'Customer not found for the provided Customer ID.' });
//       }


//       // 2. Find the Delivery document by its _id and update it
//       const updatedDelivery = await DeliveryModel.findByIdAndUpdate(
//         deliveryId,

//         {
//           $set: {
//             agentId: agentId,
//             customerId: customerId, // New field to store the customer ID
//             deliveryAgent: deliveryAgent,
//             estimatedDate: estimatedDate,
//             ...(orderStatus && { orderStatus: orderStatus })
//           }
//         },
//         { new: true, runValidators: true }
//       );

//       if (!updatedDelivery) {
//         return res.status(404).json({ success: false, message: "Delivery record not found for this ID. Cannot update non-existent delivery." });
//       }

//       await OrderModel.findByIdAndUpdate(
//         updatedDelivery.orderId,
//         {
//           deliveryAgent: agentId,
//           estimatedDate: estimatedDate,
//           ...(orderStatus && { orderStatus: orderStatus })
//         },
//         { new: true }
//       );

//       const now = moment().utcOffset("+05:30");
//       const notification = new notificationsModel({
//         notificationTitle: "Delivery Update",
//         message: `Delivery for Order ID "${updatedDelivery.orderId}" updated. Agent "${deliveryAgent}" assigned, estimated by ${moment(estimatedDate).format("YYYY-MM-DD hh:mm A")}.`,
//         date: now.format("YYYY-MM-DD"),
//         time: now.format("hh:mm A"),
//         source: "dashboard",
//         type: "success",
//       });
//       await notification.save();

//       return res.status(200).json({
//         success: true,
//         message: "Delivery updated successfully",
//         delivery: updatedDelivery,
//       });

//     } catch (error) {
//       console.error("Error updating delivery:", error);
//       return res.status(500).json({ success: false, message: "Server error during delivery update.", error: error.message });
//     }
//   }
// );

DeliveryRoute.put(
  "/update-delivery/:deliveryId",
  adminAuth,
  async (req, res) => {
    try {
      const { deliveryId } = req.params;
      const { agentId, deliveryAgent, estimatedDate, orderStatus, customerId } = req.body;

      console.log("Received update request for Delivery ID (from params):", deliveryId);
      console.log("Request body:", req.body);

      // 1. Server-side Validation
      if (!deliveryId) {
        return res.status(400).json({ success: false, message: "Delivery ID is required for updating delivery." });
      }
      if (!isValidObjectId(deliveryId)) {
        return res.status(400).json({ success: false, message: "Invalid Delivery ID format." });
      }
      if (!agentId || !deliveryAgent || !estimatedDate || !customerId) {
        return res.status(400).json({ success: false, message: 'Agent ID, Delivery Agent name, Estimated Date, and Customer ID are required for update.' });
      }
      // if (!isValidObjectId(agentId)) {
      //   return res.status(400).json({ success: false, message: 'Invalid Agent ID format.' });
      // }
      if (!isValidObjectId(customerId)) {
        return res.status(400).json({ success: false, message: 'Invalid Customer ID format.' });
      }

      // Fix: Consistent model usage for agent validation
      const agentExists = await UserModel.findById(agentId);
      if (!agentExists || agentExists.role !== 'Delivery Agent') {
        return res.status(404).json({ success: false, message: 'Delivery agent not found or does not have the "Delivery Agent" role.' });
      }
      // Fix: Added verification for customer existence
      const customerExists = await CustomerModel.findById(customerId);
      if (!customerExists) {
        return res.status(404).json({ success: false, message: 'Customer not found for the provided Customer ID.' });
      }


      // 2. Find the Delivery document by its _id and update it
      const updatedDelivery = await DeliveryModel.findByIdAndUpdate(
        deliveryId,

        {
          $set: {
            agentId: agentId,
            customerId: customerId, // New field to store the customer ID
            deliveryAgent: deliveryAgent,
            estimatedDate: estimatedDate,
            ...(orderStatus && { orderStatus: orderStatus })
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedDelivery) {
        return res.status(404).json({ success: false, message: "Delivery record not found for this ID. Cannot update non-existent delivery." });
      }

      // FIX: Fetch the human-readable orderId from the Order document
      const order = await OrderModel.findById(updatedDelivery.orderId);
      if (!order) {
        // Handle case where the order linked to the delivery no longer exists
        console.error("Associated Order not found for Delivery ID:", updatedDelivery.orderId);
      }


      await OrderModel.findByIdAndUpdate(
        updatedDelivery.orderId,
        {
          deliveryAgent: agentId,
          estimatedDate: estimatedDate,
          ...(orderStatus && { orderStatus: orderStatus })
        },
        { new: true }
      );

      const now = moment().utcOffset("+05:30");
      const notification = new notificationsModel({
        notificationTitle: "Delivery Update",
        // FIX: Use the human-readable orderId from the found order document
        message: `Delivery for Order ID "${order ? order.orderId : updatedDelivery.orderId}" updated. Agent "${deliveryAgent}" assigned, estimated by ${moment(estimatedDate).format("YYYY-MM-DD hh:mm A")}.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("hh:mm A"),
        source: "dashboard",
        type: "success",
      });
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Delivery updated successfully",
        delivery: updatedDelivery,
      });

    } catch (error) {
      console.error("Error updating delivery:", error);
      return res.status(500).json({ success: false, message: "Server error during delivery update.", error: error.message });
    }
  }
);

// Corrected backend route for handling status updates only
DeliveryRoute.put("/status-update", async (req, res) => {
  try {
    const { customerid, orderId, orderStatus } = req.body;

    // 1. Validate input
    if (!customerid || !orderId || !orderStatus) {
      return res.status(400).json({
        error: "customerid, orderId, and orderStatus are required"
      });
    }

    // 2. Find and update the order
    // Fix: Corrected the query filter to use the proper field name `customerId`
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { customerId: customerid, _id: orderId }, // Corrected filter
      { orderStatus }, // update
      { new: true } // return updated doc
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: "Order not found for this customer"
      });
    }

    // 3. Create notification
    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "Order Status Updated",
      message: `Order #${updatedOrder._id} for ${updatedOrder.customerName} is now "${orderStatus}"`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    });
    await notification.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
});


// Fix: Refactored to use req.query for a proper RESTful GET request.
// It now also performs a more flexible search using regex.
DeliveryRoute.get("/search-deliveries", adminAuth, async (req, res) => {
  try {
    const { orderId, deliveryAgent, customerId } = req.query;
    const query = {};

    if (orderId) {
      query.orderId = orderId;
    }
    if (deliveryAgent) {
      query.deliveryAgent = { $regex: new RegExp(deliveryAgent, 'i') };
    }
    if (customerId) {
      query.customerId = customerId;
    }

    const foundDeliveries = await DeliveryModel.find(query);

    if (!foundDeliveries || foundDeliveries.length === 0) {
      return res.status(404).json({ error: "Delivery not found with provided criteria." });
    }
    res.status(200).json(foundDeliveries);
  } catch (error) {
    console.error("Error searching delivery:", error);
    res.status(500).json({ error: "Server error during delivery search." });
  }
});

module.exports = DeliveryRoute;
