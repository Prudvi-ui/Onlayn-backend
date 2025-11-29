const express = require("express");
const UserRoute = express.Router();
const bcrypt = require("bcrypt");
const UsersModel = require("../../models/Users");
const jwt = require("jsonwebtoken");
const path = require("path");
const { json } = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const { adminAuth } = require("../../middlewares/adminAuth");
const notificationsModel = require("../../models/notifications");

const moment = require("moment-timezone");

UserRoute.post("/register", async (req, res) => {
  try {
    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashPassword;

    const user = new UsersModel(req.body);
    await user.save();

    res.json({ message: "User added successfully", user });
  } catch (error) {
    console.error("Error saving the user:", error);
    res.status(400).json({
      message: "Error saving the user",
      error: error.message || error,
    });
  }
});

// UserRoute.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const user = await UsersModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     if (user.role !== "Admin" && user.role !== "Super Admin") {
//       return res.status(403).json({ message: "User not Authorized" });
//     }

//     const token = jwt.sign(
//       { _id: user._id, email: user.email, firstName: user.firstName },
//       "vamsi@1998",
//       { expiresIn: "1d" }
//     );

//     // ✅ Generate timestamp before sending response
//     const now = moment().tz("Asia/Kolkata");
//     console.log(
//       "✅ DEBUG - Saving IST Time:",
//       now.format("YYYY-MM-DD hh:mm A")
//     );

//     const notification = new notificationsModel({
//       notificationTitle: "user login",
//       message: `The user titled "${
//         user.firstName || user.role || "Untitled"
//       }" has been login successfully.`,
//       date: now.format("YYYY-MM-DD"), // ✅ IST Date
//       time: now.format("hh:mm A"), // ✅ IST Time
//       source: "dashboard",
//       type: "success",
//     });
//     await notification.save(); // ✅ Save before sending response

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//     });
//     console.log("token==>",token)

//     return res.status(200).json({ message: "Login successful", token, user });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message || error.toString(),
//     });
//   }
// });

UserRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.role !== "Admin" && user.role !== "Super Admin" && user.role !== "Delivery Agent") {
      return res.status(403).json({ message: "User not Authorized" });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, firstName: user.firstName },
      "vamsi@1998",
      { expiresIn: "1d" }
    );

    // ✅ Generate timestamp before sending response
    const now = moment().tz("Asia/Kolkata");
    console.log(
      "✅ DEBUG - Saving IST Time:",
      now.format("YYYY-MM-DD hh:mm A")
    );

    const notification = new notificationsModel({
      notificationTitle: "user login",
      message: `The user titled "${
        user.firstName || user.role || "Untitled"
      }" has been login successfully.`,
      date: now.format("YYYY-MM-DD"), // ✅ IST Date
      time: now.format("hh:mm A"), // ✅ IST Time
      source: "dashboard",
      type: "success",
    });
    await notification.save(); // ✅ Save before sending response

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    console.log("token==>",token)

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || error.toString(),
    });
  }
});


UserRoute.get("/profile", adminAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(400).send({ error: error.message || "Something went wrong" });
  }
});

// UserRoute.get("/profile", adminAuth, async (req, res) => {
//   try {
//     const { _id } = req.body; // You can also use req.body if you're sending it via POST or PUT

//     if (!_id) {
//       return res.status(400).json({ error: "User ID (_id) is required" });
//     }

//     const user = await UsersModel.findById(_id).select("-password"); // exclude password

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ error: error.message || "Something went wrong" });
//   }
// });

UserRoute.get("/all-profiles", adminAuth, async (req, res) => {
  try {
    const users = await UsersModel.find();

    if (users.length === 0) {
      throw new Error("No users found");
    }

    res.send(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

UserRoute.get("/count-users", adminAuth, async (req, res) => {
  try {
    const users = await UsersModel.find();

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        count: 0,
        users: [],
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(400).json({
      message: "Error fetching users",
      error: error.message, // Send exact error in response
    });
  }
});

// UserRoute.put("/user-update", adminAuth, async (req, res) => {
//   try {
//     // ✅ 1. Ensure req.user exists (added safety)
//     if (!req.user || !req.user._id) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized access: User ID not found" });
//     }

//     // ✅ 2. Fetch user from DB
//     const loggedinUser = await UsersModel.findById(req.user._id);
//     if (!loggedinUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ✅ 3. Apply updates directly from req.body
//     const updates = Object.keys(req.body);
//     updates.forEach((key) => {
//       loggedinUser[key] = req.body[key];
//     });

//     // ✅ 4. Save updated user
//     await loggedinUser.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: " user updated",
//       message: `The user titled "${
//         loggedinUser.firstName || "Untitled"
//       }" has been updated successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "success", // optional: success/info/warning/error
//     });

//     await notification.save();
//     res.status(200).json({ message: "Update successfully", updates });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ error: error.message || "Something went wrong" });
//   }
// });
UserRoute.put("/user-update/:id", adminAuth, async (req, res) => {
  try {
    // 1. Retrieve the user ID from the URL parameters instead of the body.
    const { id } = req.params;
    const rest = req.body; // The rest of the data is now the entire body

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userToUpdate = await UsersModel.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    Object.keys(rest).forEach((key) => {
      userToUpdate[key] = rest[key];
    });

    await userToUpdate.save();

    const now = moment();
    const notification = new notificationsModel({
      notificationTitle: "User Updated",
      message: `The user "${userToUpdate.firstName || "Untitled"}" was updated successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
      type: "success",
    });

    await notification.save();
    res.status(200).json({ message: "Update successfully", updates: rest });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

UserRoute.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set to true if using HTTPS
  });
  res.status(200).json({ message: "Logged out successfully" });
});


UserRoute.get("/search", adminAuth, async (req, res) => {
  try {
    const findUser = await UsersModel.findOne(req.body);
    if (!findUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(findUser);
  } catch (error) {
    res.status(500).json({ error: error.message }); // return the exact error
  }
});

UserRoute.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // ✅ Input validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // ✅ Check if user exists
    const userIdentify = await UsersModel.findOne({ email });
    if (!userIdentify) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // ✅ Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ✅ Update the password
    const updateResult = await UsersModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(500)
        .json({ message: "Password update failed. Try again later." });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
});

UserRoute.post("/reset-password", adminAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UsersModel.updateOne(
      { email: user.email },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
});

UserRoute.get("/get-logged-in-user-details", adminAuth, async (req, res) => {
  try {
    // req.user is now set by adminAuth
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = UserRoute;
