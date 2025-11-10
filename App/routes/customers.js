// const express = require("express");
// const CustomerRoute = express.Router();
// const bcrypt = require("bcrypt");
// const CustomersModel = require("../../models/customers");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const { json } = require("body-parser");
// const multer = require("multer");
// const fs = require("fs");
// const { error } = require("console");
// const { userAuth } = require("../../middlewares/userAuth");
// const notificationsModel = require("../../models/notifications");
// const storagePath = path.join(__dirname, "../../../src/storage/userdp");

// if (!fs.existsSync(storagePath)) {
//   fs.mkdirSync(storagePath, { recursive: true });
//   console.log("Directory created:", storagePath);
// } else {
//   console.log("Directory already exists:", storagePath);
// }

// // Multer storage configuration
// const imageconfig = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, storagePath); // Use absolute path
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + path.extname(file.originalname));
//   },
// });
// var upload = multer({
//   storage: imageconfig,
//   limits: {
//     fileSize: 1000000000,
//   },
// });




// const moment = require("moment-timezone");

// CustomerRoute.post("/register", async (req, res) => {
//   try {
//     if (!req.body.password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     const hashPassword = await bcrypt.hash(req.body.password, 10);
//     req.body.password = hashPassword;

//     const customer = new CustomersModel(req.body);
//     await customer.save();

//     res.json({ message: "customer added successfully", customer });
//   } catch (error) {
//     console.error("Error saving the customer:", error);
//     res.status(400).json({
//       message: "Error saving the customer",
//       error: error.message || error,
//     });
//   }
// });

// CustomerRoute.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const customer = await CustomersModel.findOne({ email });
//     if (!customer) {
//       return res.status(404).json({ message: "customer not found" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, customer.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { _id: customer._id, email: customer.email, firstName: customer.firstName },
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
//       notificationTitle: "customer login",
//       message: `The customer titled "${
//         customer.firstName || "Untitled"
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

//     return res.status(200).json({ message: "Login successful", token, customer });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message || error.toString(),
//     });
//   }
// });

// CustomerRoute.get("/profile",async (req, res) => {
//   try {
//     const customer = req.customer;
//     res.status(200).send(customer);
//   } catch (error) {
//     console.error("Error fetching customer profile:", error);
//     res.status(400).send({ error: error.message || "Something went wrong" });
//   }
// });


// CustomerRoute.put("/customer-update", upload.single("profilePicture"), async (req, res) => {
//   try {
//     // ✅ 1. Ensure req.customer exists
//     if (!req.customer || !req.customer._id) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized access: customer ID not found" });
//     }

//     // ✅ 2. Fetch customer from DB
//     const loggedincustomer = await CustomersModel.findById(req.customer._id);
//     if (!loggedincustomer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }

//     // ✅ 3. Handle profile picture update
//     if (req.file) {
//       if (loggedincustomer.profilePicture) {
//         const oldImagePath = path.join(__dirname, "../uploads", loggedincustomer.profilePicture);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }
//       loggedincustomer.profilePicture = req.file.filename;
//     }

//     // ✅ 4. Handle address addition separately
//     if (req.body.address) {
//       let newAddress;

//       try {
//         newAddress = typeof req.body.address === "string"
//           ? JSON.parse(req.body.address)
//           : req.body.address;
//       } catch (err) {
//         return res.status(400).json({ error: "Invalid address format" });
//       }

//       loggedincustomer.address.push(newAddress); // Add without replacing
//     }

//     // ✅ 5. Update other fields (excluding address)
//     const updates = Object.keys(req.body).filter((key) => key !== "address");
//     updates.forEach((key) => {
//       loggedincustomer[key] = req.body[key];
//     });

//     // ✅ 6. Save changes
//     await loggedincustomer.save();

//     // ✅ 7. Create notification
//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "Customer updated",
//       message: `The customer titled "${loggedincustomer.firstName || "Untitled"}" has been updated successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       source: "dashboard",
//       type: "success",
//     });

//     await notification.save();

//     res.status(200).json({ message: "Update successful", customer: loggedincustomer });

//   } catch (error) {
//     console.error("Error updating customer:", error);
//     res.status(500).json({ error: error.message || "Something went wrong" });
//   }
// });

// CustomerRoute.post("/logout", async (req, res) => {
//   res.cookie("token", null, { expires: new Date(Date.now()) });
//   res.send("logged out successfully");
// });

// CustomerRoute.post("/forgot-password", async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;

//     // ✅ Input validation
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     if (!newPassword) {
//       return res.status(400).json({ message: "New password is required" });
//     }

//     if (newPassword.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters long" });
//     }

//     // ✅ Check if customer exists
//     const customerIdentify = await CustomersModel.findOne({ email });
//     if (!customerIdentify) {
//       return res.status(404).json({ message: "customer does not exist" });
//     }

//     // ✅ Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // ✅ Update the password
//     const updateResult = await CustomersModel.updateOne(
//       { email },
//       { $set: { password: hashedPassword } }
//     );

//     if (updateResult.modifiedCount === 0) {
//       return res
//         .status(500)
//         .json({ message: "Password update failed. Try again later." });
//     }

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error updating password:", error);
//     res
//       .status(500)
//       .json({ message: `Internal server error: ${error.message}` });
//   }
// });

// CustomerRoute.post("/reset-password",async (req, res) => {
//   try {
//     const customer = req.customer;
//     const { password, newPassword } = req.body;

//     if (!password || !newPassword) {
//       return res
//         .status(400)
//         .json({ message: "Both old and new passwords are required" });
//     }

//     const isMatch = await bcrypt.compare(password, customer.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     await CustomersModel.updateOne(
//       { email: customer.email },
//       { $set: { password: hashedPassword } }
//     );

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error resetting password", error: error.message });
//   }
// });

// CustomerRoute.get("/get-logged-in-customer-details",async (req, res) => {
//   try {
//     // Extract customer details from request (set by adminAuth middleware)
//     const customer = req.customer;

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       customer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// module.exports = CustomerRoute;

const express = require("express");
const CustomerRoute = express.Router();
const bcrypt = require("bcrypt");
const CustomersModel = require("../../models/customers");
const jwt = require("jsonwebtoken");
const path = require("path");
const { json } = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const { error } = require("console");
const { userAuth } = require("../../middlewares/userAuth");
const notificationsModel = require("../../models/notifications");
const storagePath = path.join(__dirname, "../../storage/userdp");

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log("Directory created:", storagePath);
} else {
  console.log("Directory already exists:", storagePath);
}

// Multer storage configuration
const imageconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storagePath); // Use absolute path
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});
var upload = multer({
  storage: imageconfig,
  limits: {
    fileSize: 1000000000,
  },
});




const moment = require("moment-timezone");

// CustomerRoute.post("/register", upload.single("profilePicture"), async (req, res) => {
//   try {
//     if (req.file) {
//       req.body.profilePicture = req.file.filename;
//     } else {
//       req.body.profilePicture = "";
//       console.log("⚠ No file uploaded");
//     }
//     if (!req.body.password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     const hashPassword = await bcrypt.hash(req.body.password, 10);
//     req.body.password = hashPassword;
//     const customer = new CustomersModel(req.body);
//     await customer.save();
//     const notification = new notificationsModel({
//       customerid: customer._id, // Add this line
//       notificationTitle: "New donor Created",
//       message: Welcome ${customer.firstName || "Untitled"} has been Register successfully.,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       type: "success",
//     });
//     await notification.save();


//     res.json({ message: "customer added successfully", customer });
//   } catch (error) {
//     console.error("Error saving the customer:", error);
//     res.status(400).json({
//       message: "Error saving the customer",
//       error: error.message || error,
//     });
//   }
// });

CustomerRoute.post("/register", upload.single("profilePicture"), async (req, res) => {
  try {
    if (req.file) {
      req.body.profilePicture = req.file.filename;
    } else {
      req.body.profilePicture = "";
      console.log("⚠ No file uploaded");
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashPassword;

    const customer = new CustomersModel(req.body);
    await customer.save();

    // ✅ Add now before using
    const now = moment().tz("Asia/Kolkata");

    const notification = new notificationsModel({
      customerid: customer._id,
      notificationTitle: "New Customer Created",
      message: `Welcome ${customer.firstName || "Untitled"}! You have registered successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      type: "success",
    });
    await notification.save();

    res.json({ message: "Customer added successfully", customer });
  } catch (error) {
    console.error("Error saving the customer:", error);
    res.status(400).json({
      message: "Error saving the customer",
      error: error.message || error,
    });
  }
});


CustomerRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const customer = await CustomersModel.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { _id: customer._id, email: customer.email, firstName: customer.firstName },
      "vamsi@1998",
      { expiresIn: "1d" }
    );

    const now = moment().tz("Asia/Kolkata");

    const notification = new notificationsModel({
      customerId: customer._id,
      notificationTitle: "Login",
      message: `Thanks ${customer.firstName || "User"} for logging in successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      type: "success",
    });

    await notification.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Login successful", token, customer });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || error.toString(),
    });
  }
});


CustomerRoute.get("/profile", async (req, res) => {
  try {
    const customer = req.customer;
    res.status(200).send(customer);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(400).send({ error: error.message || "Something went wrong" });
  }
});

CustomerRoute.get("/Customers-data", async (req, res) => {
  const { _id } = req.query;  // read from query params

  try {
    const Customers = await CustomersModel.find({ _id });
    res.status(200).json({ success: true, response: Customers });
  } catch (error) {
    console.error("Error fetching Customers data:", error);
    res.status(500).json({ success: false, message: "Error fetching Customers data" });
  }
});

CustomerRoute.put("/customer-update", upload.single("profilePicture"), async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(401).json({ error: "Unauthorized access: customer ID not found" });
    }

    const loggedincustomer = await CustomersModel.findById(_id);
    if (!loggedincustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // ✅ Fix profile picture deletion path
    if (req.file) {
      if (loggedincustomer.profilePicture) {
        const oldImagePath = path.join(storagePath, loggedincustomer.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      loggedincustomer.profilePicture = req.file.filename;
    }

    // ✅ Handle address addition
    if (req.body.address) {
      let newAddress;
      try {
        newAddress = typeof req.body.address === "string"
          ? JSON.parse(req.body.address)
          : req.body.address;
      } catch (err) {
        return res.status(400).json({ error: "Invalid address format" });
      }
      loggedincustomer.address.push(newAddress);
    }

    // ✅ Update other fields
    const updates = Object.keys(req.body).filter((key) => key !== "address");
    updates.forEach((key) => {
      loggedincustomer[key] = req.body[key];
    });

    await loggedincustomer.save();

    const now = moment().tz("Asia/Kolkata");

    // ✅ Correct reference
    const notification = new notificationsModel({
      customerId: loggedincustomer._id,
      notificationTitle: "Profile Update",
      message: `Thanks! ${loggedincustomer.firstName || "Untitled"} Your profile has been updated successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      type: "success",
    });

    await notification.save();

    res.status(200).json({ message: "Update successful", customer: loggedincustomer });

  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});


CustomerRoute.delete("/customer-address/:customerId/:addressId", async (req, res) => {
  try {
    const { customerId, addressId } = req.params;

    if (!customerId || !addressId) {
      return res.status(400).json({ error: "Customer ID and Address ID are required" });
    }

    const customer = await CustomersModel.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const addressIndex = customer.address.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) return res.status(404).json({ error: "Address not found" });

    customer.address.splice(addressIndex, 1); // remove the address
    await customer.save();

    res.status(200).json({ message: "Address deleted successfully", customer });

  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});


CustomerRoute.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logged out successfully");
});

CustomerRoute.post("/forgot-password", async (req, res) => {
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

    // ✅ Check if customer exists
    const customerIdentify = await CustomersModel.findOne({ email });
    if (!customerIdentify) {
      return res.status(404).json({ message: "customer does not exist" });
    }

    // ✅ Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ✅ Update the password
    const updateResult = await CustomersModel.updateOne(
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
      .json(`{ message: Internal server error: ${error.message} }`);
  }
});

CustomerRoute.post("/reset-password", async (req, res) => {
  try {
    const customer = req.customer;
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await CustomersModel.updateOne(
      { email: customer.email },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
});

CustomerRoute.get("/get-logged-in-customer-details", async (req, res) => {
  try {
    // Extract customer details from request (set by adminAuth middleware)
    const customer = req.customer;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = CustomerRoute;