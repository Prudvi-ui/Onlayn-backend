// const express = require("express");
// const DeliveryRoute = express.Router();
// const DeliveryModel = require("../../models/deliverypincode");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const { json } = require("body-parser");
// const fs = require("fs");
// const { error } = require("console");
// const { userAuth } = require("../../middlewares/userAuth")
// const { adminAuth } = require("../../middlewares/adminAuth")
// const {isValidObjectId} = require("../../utils/validation");
// const mongoose = require("mongoose");
// const notificationsModel = require("../../models/notifications");

// const moment = require("moment-timezone");


// DeliveryRoute.post("/create-delivery-pincode",async (req, res) => {
//   try {
    
//     const delivery = new DeliveryModel(req.body);
//     await delivery.save();

//     res.json({ message: "delivery pincode added successfully", delivery });
//   } catch (error) {
//     console.error("Error adding  the delivery:", error);
//     res.status(400).json({ message: "Error adding  the delivery", error });
//   }
// });

// DeliveryRoute.delete("/delete-delivery-pincode/:id",async (req, res) => {
//     try {
//         const deliveryId  = req.params.id;

//         // Ensure `id` is a valid MongoDB ObjectId
//         if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
//             return res.status(400).json({ error: "Invalid delivery ID" });
//         }

//         const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);

//         if (!deletedDelivery) {
//             return res.status(404).json({ error: "Delivery pincode not found" });
//         }

//         res.json({ message: "Delivery pincode deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting delivery pincode:", error);
//         res.status(500).json({ error: "Error deleting the delivery pincode" });
//     }
// });

// DeliveryRoute.get("/all-delivery-pincodes",adminAuth,async (req, res) => {
//     try {
//          const delivery = await DeliveryModel.find();
//          if (!delivery) {
//            return res.status(404).json({ error: "delivery not found" });
//          }
//          res.send(delivery);
//        } catch (error) {
//          console.error("Error fetching delivery data", error);
//          res.status(400).send("Bad request");
//        }
//   });


// DeliveryRoute.patch(
//   "/update-delivery-pincode",
//   async (req, res) => {
//     try {
//       const pincodeId = req.body._id;

//       console.log("Received update request for delivery ID:", pincodeId);
//       console.log("Request body:", req.body);

//       if (!pincodeId) {
//         return res.status(400).json({ error: "Delivery ID is required for updating" });
//       }

//       if (!isValidObjectId(pincodeId)) {
//         return res.status(400).json({ error: "Invalid ID format" });
//       }

//       let delivery = await DeliveryModel.findById(pincodeId);
//       if (!delivery) {
//         return res.status(404).json({ error: "Delivery not found" });
//       }

//       // Dynamically update all fields provided in req.body except _id
//       Object.keys(req.body).forEach(key => {
//         if (key !== "_id") {
//           delivery[key] = req.body[key];
//         }
//       });

//       await delivery.save();

//       // Notification (if agent is assigned)
//       const now = moment().utcOffset("+05:30");

//       const notification = new notificationsModel({
//         notificationTitle: "Delivery Pincode Update",
//         message: `Delivery details for pincode "${delivery.pincode}" have been updated successfully.`,
//         date: now.format("YYYY-MM-DD"),
//         time: now.format("hh:mm A"),
//         source: "dashboard",
//         type: "success",
//       });

//       await notification.save();

//       return res.json({
//         message: "Delivery updated successfully",
//         delivery,
//       });

//     } catch (error) {
//       console.error("Error updating delivery:", error);
//       return res.status(500).json({ error: "Something went wrong" });
//     }
//   }
// );

// DeliveryRoute.get("/search-deliveries",async(req,res)=>
// {
//   try {
//     const findUser = await DeliveryModel.findOne(req.body);
//   res.send(findUser)
// } catch (error) {
//   res.status(500).json({ error: "delivery not found" });
// }
// })

// module.exports = DeliveryRoute;

const express = require("express");
const DeliveryRoute = express.Router();
const DeliveryModel = require("../../models/deliverypincode");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth")
const { adminAuth } = require("../../middlewares/adminAuth")
const { isValidObjectId } = require("../../utils/validation");
const mongoose = require("mongoose");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");


DeliveryRoute.post("/create-delivery-pincode", async (req, res) => {
  try {
    const { pincode, deliveryPrice, minOrder, status } = req.body;

    // Basic validation
    if (!pincode || deliveryPrice == null ) {
      return res.status(400).json({
        message: "Pincode, Delivery Price, and Minimum Order are required.",
      });
    }

    const newDelivery = new DeliveryModel({
      pincode: pincode.trim(),
      deliveryPrice: deliveryPrice,
      // minOrder: minOrder,
      // status: status || "Active",
    });

    const savedDelivery = await newDelivery.save();

    res.status(201).json({
      message: "Delivery pincode added successfully",
      data: savedDelivery,
    });
  } catch (error) {
    console.error("Error adding the delivery:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(", "),
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while adding delivery pincode",
      error: error.message,
    });
  }
});

DeliveryRoute.delete("/delete-delivery-pincode/:id", async (req, res) => {
  try {
    const deliveryId = req.params.id;

    // Ensure id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ error: "Invalid delivery ID" });
    }

    const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);

    if (!deletedDelivery) {
      return res.status(404).json({ error: "Delivery pincode not found" });
    }

    res.json({ message: "Delivery pincode deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery pincode:", error);
    res.status(500).json({ error: "Error deleting the delivery pincode" });
  }
});

DeliveryRoute.get("/all-delivery-pincodes", async (req, res) => {
  try {
    const delivery = await DeliveryModel.find();
    if (!delivery) {
      return res.status(404).json({ error: "delivery not found" });
    }
    res.send(delivery);
  } catch (error) {
    console.error("Error fetching delivery data", error);
    res.status(400).send("Bad request");
  }
});


DeliveryRoute.patch(
  "/update-delivery-pincode",

  async (req, res) => {
    try {
      const pincodeId = req.body._id;

      console.log("Received update request for delivery ID:", pincodeId);
      console.log("Request body:", req.body);

      if (!pincodeId) {
        return res.status(400).json({ error: "Delivery ID is required for updating" });
      }

      if (!isValidObjectId(pincodeId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      let delivery = await DeliveryModel.findById(pincodeId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      // Dynamically update all fields provided in req.body except _id
      Object.keys(req.body).forEach(key => {
        if (key !== "_id") {
          delivery[key] = req.body[key];
        }
      });

      await delivery.save();

      // Notification (if agent is assigned)
      const now = moment().utcOffset("+05:30");

      const notification = new notificationsModel({
        notificationTitle: "Delivery Pincode Update",
        message: `Delivery details for pincode "${delivery.pincode}" have been updated successfully.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("hh:mm A"),
        source: "dashboard",
        type: "success",
      });

      await notification.save();

      return res.json({
        message: "Delivery updated successfully",
        delivery,
      });

    } catch (error) {
      console.error("Error updating delivery:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
);

DeliveryRoute.get("/search-deliveries", async (req, res) => {
  try {
    const findUser = await DeliveryModel.findOne(req.body);
    res.send(findUser)
  } catch (error) {
    res.status(500).json({ error: "delivery not found" });
  }
})

module.exports = DeliveryRoute;