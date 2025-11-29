const express = require("express");
const NotificationRoute = express.Router();
const notificationModel = require("../../models/notifications"); // Assuming your model is named 'notifications.js'
const mongoose = require("mongoose");
const { adminAuth } = require("../../middlewares/adminAuth"); // Assuming adminAuth is here
const { userAuth } = require("../../middlewares/userAuth");

// ====================================================================
// 1. DELETE Single Notification API
// Endpoint: /delete-notification/:id
// ====================================================================
NotificationRoute.delete("/delete-notification/:id", adminAuth, async (req, res) => {
    try {
        const _id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: "Invalid notification ID." });
        }

        const deletedNotification = await notificationModel.findByIdAndDelete(_id);

        if (!deletedNotification) {
            return res.status(404).json({ error: "Notification not found." });
        }

        res.status(200).json({ message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: error.message || "Failed to delete notification." });
    }
});

// ====================================================================
// 2. DELETE All Notifications API
// Endpoint: /delete-all-notifications
// ====================================================================
NotificationRoute.delete("/delete-all-notifications", async (req, res) => {
    try {
        const result = await notificationModel.deleteMany({}); // deletes all notifications
        console.log(`Backend: Deleted ${result.deletedCount} notifications successfully.`); // Debug log
        res.status(200).json({
            message: `Deleted ${result.deletedCount} notifications successfully.`,
        });
    } catch (error) {
        console.error("Error deleting all notifications:", error);
        res.status(500).json({ error: error.message || "Failed to delete all notifications." });
    }
});

// ====================================================================
// 3. GET All Notifications API
// Endpoint: /all-notifications
// This is the primary endpoint your frontend's NotificationContext uses.
// ====================================================================
NotificationRoute.get("/all-notifications",async (req, res) => {
    try {
        // Ensure your notificationModel schema has `timestamps: true`
        // and that 'read' field is a boolean.
        const notifications = await notificationModel.find({}).sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json({ notifications }); 
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

// NotificationRoute.get("/notifications",async (req, res) => {
//     try {
//         // Ensure your notificationModel schema has `timestamps: true`
//         // and that 'read' field is a boolean.
//         const notifications = await notificationModel.find({}).sort({ createdAt: -1 }); // Sort by newest first
//         res.status(200).json({ notifications }); 
//     } catch (error) {
//         console.error("Error fetching all notifications:", error);
//         res.status(500).json({ message: "Failed to fetch notifications." });
//     }
// });

// NotificationRoute.get("/notifications", userAuth, async (req, res) => {
//   try {
//     const customerId = req.customer?._id; // logged-in customerId

//     let notifications = await notificationModel
//       .find({})
//       .sort({ createdAt: -1 });

//     // ✅ Filter conditions
//     notifications = notifications.filter((n) => {
//       // 1. Skip if source is "dashboard"
//       if (n.source === "dashboard") return false;

//       // 2. Skip if notification belongs to another customer
//       if (n.customerId && n.customerId.toString() !== customerId.toString()) {
//         return false;
//       }

//       return true; // keep otherwise
//     });

//     res.status(200).json({ notifications });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ message: "Failed to fetch notifications." });
//   }
// });

NotificationRoute.get("/notifications", userAuth, async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID not found" });
    }

    const notifications = await notificationModel.find({
      $or: [
        { customerId: customerId }, // personal
        { customerId: null, source: { $ne: "dashboard" } }, // global
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});



// ====================================================================
// 4. GET Notification Count API
// Endpoint: /count-notifications
// ====================================================================
NotificationRoute.get("/count-notifications", adminAuth, async (req, res) => {
    try {
        const count = await notificationModel.countDocuments(); // Efficiently count all notifications
        res.status(200).json({ count }); // Return just the count
    } catch (error) {
        console.error("Error fetching notifications count:", error);
        res.status(500).json({ error: error.message || "Failed to count notifications." });
    }
});

// ====================================================================
// 5. PATCH Mark Single Notification as Read API
// Endpoint: /mark-as-read/:id
// ====================================================================
NotificationRoute.patch("/mark-as-read/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid notification ID." });
        }

        const notification = await notificationModel.findByIdAndUpdate(id, { read: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }
        console.log(`Backend: Marked notification ${id} as read.`); // Debug log
        res.status(200).json({ message: "Notification marked as read.", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read." });
    }
});

// ====================================================================
// 6. PATCH Mark ALL Notifications as Read API
// Endpoint: /mark-all-as-read
// This is the endpoint called when you click the bell icon in the Navbar.
// ====================================================================
NotificationRoute.patch("/mark-all-as-read", adminAuth, async (req, res) => {
    try {
        // --- ENHANCED DEBUGGING ---
        // 1. Fetch all notifications to inspect their 'read' status
        const allNotifications = await notificationModel.find({});
        console.log(`Backend Debug: Total notifications found: ${allNotifications.length}`);
        allNotifications.forEach((note, index) => {
            console.log(`Backend Debug: Notification ${index} (_id: ${note._id}): read = ${note.read} (Type: ${typeof note.read})`);
        });

        // 2. Fetch only unread notifications to see what the query finds
        const unreadNotificationsBeforeUpdate = await notificationModel.find({ read: false });
        console.log(`Backend Debug: Found ${unreadNotificationsBeforeUpdate.length} notifications with read: false before update.`);
        console.log("Backend Debug: Data for notifications with read: false:", unreadNotificationsBeforeUpdate);

        // This query updates all documents where 'read' is explicitly boolean false to true
        const result = await notificationModel.updateMany({ read: false }, { read: true });
        console.log(`Backend: Marked ${result.modifiedCount} notifications as read.`); // Debug log
        res.status(200).json({ message: `Marked ${result.modifiedCount} notifications as read.` });
    } catch (error) {
        console.error("Backend Error marking all notifications as read:", error); // Debug log
        res.status(500).json({ message: "Failed to mark all notifications as read.", error: error.message });
    }
});

module.exports = NotificationRoute;
