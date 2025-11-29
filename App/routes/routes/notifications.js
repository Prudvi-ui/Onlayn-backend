// const express = require("express");
// const NotificationRoute = express.Router();
// const notificationModel = require("../../models/notifications");
// const mongoose = require("mongoose");
// const { adminAuth } = require("../../middlewares/adminAuth");


// // DELETE /delete-notification/:id
// NotificationRoute.delete("/delete-notification/:id",async (req, res) => {
//   try {
//     const  _id  = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(400).json({ error: "Invalid notification ID." });
//     }

//     const deletedNotification = await notificationModel.findByIdAndDelete(_id);

//     if (!deletedNotification) {
//       return res.status(404).json({ error: "Notification not found." });
//     }

//     res.status(200).json({ message: "Notification deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting notification:", error);
//     res.status(500).json({ error: error.message || "Failed to delete notification." });
//   }
// });

// NotificationRoute.delete("/delete-all-notifications",async (req, res) => {
//   try {
//     const result = await notificationModel.deleteMany({}); // deletes all notifications

//     res.status(200).json({
//       message: `Deleted ${result.deletedCount} notifications successfully.`,
//     });
//   } catch (error) {
//     console.error("Error deleting all notifications:", error);
//     res.status(500).json({ error: error.message || "Failed to delete all notifications." });
//   }
// });


// // GET /notification - Get all notifications
// NotificationRoute.get("/notification", async (req, res) => {
//   try {
//     const notifications = await notificationModel.findOne();

//     if (!notifications || notifications.length === 0) {
//       return res.status(404).json({ error: "No notifications found." });
//     }

//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ error: error.message || "Failed to fetch notifications." });
//   }
// });


// // GET /notifications - (Alias of above, or if needed separately)
// NotificationRoute.get("/notifications", async (req, res) => {
//   try {
//     const { source } = req.query;
//     console.log("Received source:", source); // DEBUG

//     if (!source || source !== "dashboard") {
//       return res.status(400).json({
//         error: "Valid 'source' query param is required and must be 'dashboard'."
//       });
//     }

//     const notifications = await notificationModel.find();
//     const filtered = notifications.filter(n => n.source === "dashboard");

//     if (!filtered.length) {
//       return res.status(404).json({ error: "No notifications available for this source." });
//     }

//     console.log("Filtered notifications:", filtered.map(n => n.source));

//     res.status(200).json(filtered);
//   } catch (error) {
//     console.error("Error in /notifications route:", error);
//     res.status(500).json({ error: error.message || "Failed to retrieve notifications." });
//   }
// });



// // GET /count-notifications - Count notifications
// NotificationRoute.get("/count-notifications",async (req, res) => {
//   try {
//     const notifications = await notificationModel.find();
//     if (!source || !["dashboard"].includes(source)) {
//       return res.status(400).json({ error: "Valid 'source' query param is required (app or dashboard)." });
//     }
    
//     if (!notifications || notifications.length === 0) {
//       return res.status(404).json({ error: "No notifications found.", count: 0, notifications: [] });
//     }

//     res.status(200).json({ count: notifications.length, notifications });
//   } catch (error) {
//     console.error("Error fetching notifications count:", error);
//     res.status(500).json({ error: error.message || "Failed to count notifications." });
//   }
// });


// module.exports = NotificationRoute;

const express = require("express");
const NotificationRoute = express.Router();
const notificationModel = require("../../models/notifications");
const mongoose = require("mongoose");
const { adminAuth } = require("../../middlewares/adminAuth");


// DELETE /delete-notification/:id
NotificationRoute.delete("/delete-notification/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid notification ID." });
    }

    const deletedNotification = await notificationModel.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ error: "Failed to delete notification." });
  }
});

NotificationRoute.delete("/delete-notification", async (req, res) => {
  try {
    const { _id } = req.body;

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

NotificationRoute.delete("/delete-all-notifications", async (req, res) => {
  try {
    const result = await notificationModel.deleteMany({}); // deletes all notifications

    res.status(200).json({
      message: `Deleted ${result.deletedCount} notifications successfully.`,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: error.message || "Failed to delete all notifications." });
  }
});


// GET /notification - Get all notifications
NotificationRoute.get("/notification", async (req, res) => {
  try {
    const notifications = await notificationModel.findOne();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ error: "No notifications found." });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message || "Failed to fetch notifications." });
  }
});


// GET /notifications - (Alias of above, or if needed separately)
NotificationRoute.get("/notifications", async (req, res) => {
  try {
    const { source } = req.query;
    console.log("Received source:", source); // DEBUG

    if (!source || source !== "dashboard") {
      return res.status(400).json({
        error: "Valid 'source' query param is required and must be 'dashboard'."
      });
    }

    const notifications = await notificationModel.find();
    // const filtered = notifications.filter(n => n.source === "dashboard");

    // if (!filtered.length) {
    //   return res.status(404).json({ error: "No notifications available for this source." });
    // }

    // console.log("Filtered notifications:", filtered.map(n => n.source));

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in /notifications route:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve notifications." });
  }
});

NotificationRoute.get("/all-notifications", async (req, res) => {
  try {
    // Ensure your notificationModel schema has timestamps: true
    // and that 'read' field is a boolean.
    const notifications = await notificationModel.find({}).sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json({ notifications }); // Consistent response structure
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

// GET /count-notifications - Count notifications
NotificationRoute.get("/count-notifications", async (req, res) => {
  try {
    const notifications = await notificationModel.find();
    if (!source || !["dashboard"].includes(source)) {
      return res.status(400).json({ error: "Valid 'source' query param is required (app or dashboard)." });
    }

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ error: "No notifications found.", count: 0, notifications: [] });
    }

    res.status(200).json({ count: notifications.length, notifications });
  } catch (error) {
    console.error("Error fetching notifications count:", error);
    res.status(500).json({ error: error.message || "Failed to count notifications." });
  }
});


module.exports = NotificationRoute;