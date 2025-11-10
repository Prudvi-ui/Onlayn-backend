// const express = require("express");
// const DeliveryRoute = express.Router();
// const DeliveryModel = require("../../models/delivery");
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


// DeliveryRoute.post("/create-delivery",async (req, res) => {
//   try {

//     const delivery = new DeliveryModel(req.body);
//     await delivery.save();

//     res.json({ message: "delivery added successfully", delivery });
//   } catch (error) {
//     console.error("Error adding  the delivery:", error);
//     res.status(400).json({ message: "Error adding  the delivery", error });
//   }
// });

// DeliveryRoute.delete("/delete-delivery/:id",async (req, res) => {
//     try {
//         const deliveryId  = req.params.id;

//         // Ensure `id` is a valid MongoDB ObjectId
//         if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
//             return res.status(400).json({ error: "Invalid delivery ID" });
//         }

//         const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);

//         if (!deletedDelivery) {
//             return res.status(404).json({ error: "Delivery not found" });
//         }

//         res.json({ message: "Delivery deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting delivery:", error);
//         res.status(500).json({ error: "Error deleting the delivery" });
//     }
// });

// DeliveryRoute.get("/all-deliveries",async (req, res) => {
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

// DeliveryRoute.get("/count-deliveries",async (req, res) => {
//   try {
//     const deliveries = await DeliveryModel.find();

//     if (!deliveries || deliveries.length === 0) {
//       return res.status(404).json({ message: "No categories found", count: 0, deliveries: [] });
//     }

//     res.json({ count: deliveries.length, deliveries });
//   } catch (error) {
//     console.error("Error fetching deliveries count:", error);
//     res.status(400).json({ message: "Bad request" });
//   }
// });


// DeliveryRoute.patch(
//   "/update-status",
//   async (req, res) => {
//     try {
//       const deliveryId = req.body._id;

//       console.log("Received update request for delivery ID:", deliveryId);
//       console.log("Request body:", req.body);

//       if (!deliveryId) {
//         return res.status(400).json({ error: "Delivery ID is required for updating" });
//       }

//       if (!isValidObjectId(deliveryId)) {
//         return res.status(400).json({ error: "Invalid ID format" });
//       }

//       let delivery = await DeliveryModel.findById(deliveryId);
//       if (!delivery) {
//         return res.status(404).json({ error: "Delivery not found" });
//       }

//       // Update fields
//       if (req.body.deliveryAgent) {
//         delivery.deliveryAgent = req.body.deliveryAgent;
//       }

//       if (req.body.estimatedDate) {
//         delivery.estimatedDate = req.body.estimatedDate;
//       }

//       if (req.body.orderStatus) {
//         delivery.orderStatus = req.body.orderStatus;
//       }

//       await delivery.save();

//       // Notification
//       const now = moment().utcOffset("+05:30"); // Indian Standard Time

//       const notification = new notificationsModel({
//         notificationTitle: "Delivery Update",
//         message: `Agent "${delivery.deliveryAgent}" has been assigned to Order ID "${delivery.orderId}" successfully.`,
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
const DeliveryModel = require("../../models/delivery");
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


DeliveryRoute.post("/create-delivery", async (req, res) => {
  try {

    const delivery = new DeliveryModel(req.body);
    await delivery.save();

    res.json({ message: "delivery added successfully", delivery });
  } catch (error) {
    console.error("Error adding  the delivery:", error);
    res.status(400).json({ message: "Error adding  the delivery", error });
  }
});

DeliveryRoute.delete("/delete-delivery/:id", async (req, res) => {
  try {
    const deliveryId = req.params.id;

    // Ensure id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ error: "Invalid delivery ID" });
    }

    const deletedDelivery = await DeliveryModel.findByIdAndDelete(deliveryId);

    if (!deletedDelivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ error: "Error deleting the delivery" });
  }
});

DeliveryRoute.get("/all-deliveries", async (req, res) => {
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

DeliveryRoute.get("/:customerId/:orderId", async (req, res) => {
  try {
    const { customerId, orderId } = req.params;

    const deliveryDetails = await DeliveryModel.find({
      customerId: customerId,
      orderId: orderId,
    })
      .populate("customerId", "name email")
      .populate("agentId", "name email");

    if (!deliveryDetails || deliveryDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No delivery details found for this order",
      });
    }

    res.status(200).json({
      success: true,
      data: deliveryDetails,
    });
  } catch (error) {
    console.error("Error fetching delivery data:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching delivery details",
    });
  }
});

DeliveryRoute.get("/count-deliveries", async (req, res) => {
  try {
    const deliveries = await DeliveryModel.find();

    if (!deliveries || deliveries.length === 0) {
      return res.status(404).json({ message: "No categories found", count: 0, deliveries: [] });
    }

    res.json({ count: deliveries.length, deliveries });
  } catch (error) {
    console.error("Error fetching deliveries count:", error);
    res.status(400).json({ message: "Bad request" });
  }
});


DeliveryRoute.patch(
  "/update-status",
  async (req, res) => {
    try {
      const deliveryId = req.body._id;

      console.log("Received update request for delivery ID:", deliveryId);
      console.log("Request body:", req.body);

      if (!deliveryId) {
        return res.status(400).json({ error: "Delivery ID is required for updating" });
      }

      if (!isValidObjectId(deliveryId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      let delivery = await DeliveryModel.findById(deliveryId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      // Update fields
      if (req.body.deliveryAgent) {
        delivery.deliveryAgent = req.body.deliveryAgent;
      }

      if (req.body.estimatedDate) {
        delivery.estimatedDate = req.body.estimatedDate;
      }

      if (req.body.orderStatus) {
        delivery.orderStatus = req.body.orderStatus;
      }

      await delivery.save();

      // Notification
      const now = moment().utcOffset("+05:30"); // Indian Standard Time

      const notification = new notificationsModel({
        notificationTitle: "Delivery Update",
        message: `Agent "${delivery.deliveryAgent}" has been assigned to Order ID "${delivery.orderId}" successfully.`,
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