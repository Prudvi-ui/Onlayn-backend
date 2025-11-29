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



CustomerRoute.post("/register", async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check existing user
    const existingUser = await CustomersModel.findOne({
      $or: [{ email }, { mobileNumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existingUser.mobileNumber === mobileNumber) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = new CustomersModel({
      ...req.body,
      password: hashPassword,
    });
    await customer.save();

    // Create notification
    const now = moment();
    const notification = new notificationsModel({
      customerid: customer._id,
      notificationTitle: "New Customer Created",
      message: `Welcome ${customer.firstName || "Untitled"}! You have registered successfully.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      type: "success",
    });

    await notification.save(); // If this fails, it'll go to catch

    // ✅ Only send response after everything succeeds
    return res.json({ message: "Customer added successfully", customer });

  } catch (error) {
    console.error("Error saving the customer:", error);
    return res.status(400).json({
      message: "Please Enter your valid Name",
      error: error.message || error,
    });
  }
});



CustomerRoute.get("/customer-profile", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id;

    const customerData = await CustomersModel.findById(customerId).select("-password");

    if (!customerData) {
      return res.status(404).send({ error: "Customer not found" });
    }

    res.status(200).send(customerData);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(400).send({ error: error.message || "Something went wrong" });
  }
});


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

//     // ✅ Save notification with customerId
//     const notification = new notificationsModel({
//       notificationTitle: "customer login",
//       message: `The customer titled "${
//         customer.firstName || "Untitled"
//       }" has logged in successfully.`,
//       date: now.format("YYYY-MM-DD"), // ✅ IST Date
//       time: now.format("hh:mm A"),    // ✅ IST Time
//       type: "success",
//       customerId: customer._id,       // ✅ Store customerId here
//     });
//     await notification.save();

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//     });

//     // ✅ Do NOT expose customerId in response
//     return res.status(200).json({
//       message: "Login successful",
//       token,
//       customer: {
//         _id: customer._id,
//         email: customer.email,
//         firstName: customer.firstName,
//       }
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message || error.toString(),
//     });
//   }
// });


CustomerRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const customer = await CustomersModel.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "customer not found" });
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

    // ✅ Generate timestamp before sending response
    const now = moment().tz("Asia/Kolkata");
    console.log(
      "✅ DEBUG - Saving IST Time:",
      now.format("YYYY-MM-DD hh:mm A")
    );

    const notification = new notificationsModel({
      notificationTitle: "customer login",
      message: `Thanks ${customer.firstName || "User"} for logging in successfully.`,
      customerId: customer._id,   // ✅ add this line
      date: now.format("YYYY-MM-DD"), 
      time: now.format("hh:mm A"), 
      source: "dashboard",
      type: "success",
    });    
    await notification.save(); // ✅ Save before sending response

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

CustomerRoute.get("/profile",userAuth,async (req, res) => {
  try {
    const customer = req.customer;
    res.status(200).send(customer);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(400).send({ error: error.message || "Something went wrong" });
  }
});



CustomerRoute.get("/customers", async (req, res) => {
  try {
    const customers = await CustomersModel.find(); 

    if (!customers || customers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No customers found" });
    }

    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error("Error in customers route:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

// Delete a customer by ID
CustomerRoute.delete("/delete-customer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCustomer = await CustomersModel.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});



// CustomerRoute.put("/customer-update", userAuth, upload.single("profilePicture"), async (req, res) => {
//   try {
//     // 1. Ensure req.customer exists (added safety)
//     if (!req.customer || !req.customer._id) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized access: customer ID not found" });
//     }

//     // 2. Fetch customer from DB
//     const loggedincustomer = await CustomersModel.findById(req.customer._id);
//     if (!loggedincustomer) {
//       return res.status(404).json({ error: "customer not found" });
//     }

//     // Handle profile picture update
//     if (req.file) {
//       if (loggedincustomer.profilePicture) {
//         // Ensure the path is correct for your 'storage/userdp' directory
//         const oldImagePath = path.join(__dirname, "..", "storage", "userdp", loggedincustomer.profilePicture);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }
//       loggedincustomer.profilePicture = req.file.filename;
//     }

//     // 3. Apply updates from req.body
//     const updates = Object.keys(req.body);
//     updates.forEach((key) => {
//       if (key === 'address') {
//         // ✅ CRITICAL FIX: Parse the JSON string back into an array for the 'address' field
//         try {
//           // Only parse if req.body.address exists and is a string
//           if (typeof req.body.address === 'string') {
//               loggedincustomer.address = JSON.parse(req.body.address);
//           } else {
//               // If it's not a string (e.g., already an array or undefined), assign directly
//               loggedincustomer.address = req.body.address;
//           }
//         } catch (parseError) {
//           console.error("Error parsing address JSON:", parseError);
//           return res.status(400).json({ error: "Invalid address data format" });
//         }
//       } else {
//         loggedincustomer[key] = req.body[key];
//       }
//     });

//     // 4. Save updated customer
//     await loggedincustomer.save();

//     const now = moment();
//     const notification = new notificationsModel({
//       notificationTitle: "customer updated",
//       message: `The customer titled "${
//         loggedincustomer.firstName || "Untitled"
//       }" has been updated successfully.`,
//       date: now.format("YYYY-MM-DD"),
//       time: now.format("h:mm A"),
//       type: "success", // optional: success/info/warning/error
//     });

//     await notification.save();
//     res.status(200).json({ message: "Update successfully", updates: loggedincustomer }); // Send updated customer for clarity
//   } catch (error) {
//     console.error("Error updating customer:", error);
//     res.status(500).json({ error: error.message || "Something went wrong" });
//   }
// });

// CustomerRoute.put(
//   "/customer-update",
//   userAuth,
//   upload.single("profilePicture"),
//   async (req, res) => {
//     try {
//       // 1. Ensure req.customer exists (added safety)
//       if (!req.customer || !req.customer._id) {
//         return res
//           .status(401)
//           .json({ error: "Unauthorized access: customer ID not found" });
//       }

//       // 2. Fetch customer from DB
//       const loggedincustomer = await CustomersModel.findById(req.customer._id);
//       if (!loggedincustomer) {
//         return res.status(404).json({ error: "customer not found" });
//       }

//       // Handle profile picture update
//       if (req.file) {
//         if (loggedincustomer.profilePicture) {
//           const oldImagePath = path.join(
//             __dirname,
//             "..",
//             "storage",
//             "userdp",
//             loggedincustomer.profilePicture
//           );
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath);
//           }
//         }
//         loggedincustomer.profilePicture = req.file.filename;
//       }

//       // 3. Apply updates from req.body
//       const updates = Object.keys(req.body);
//       updates.forEach((key) => {
//         if (key === "address") {
//           try {
//             if (typeof req.body.address === "string") {
//               loggedincustomer.address = JSON.parse(req.body.address);
//             } else {
//               loggedincustomer.address = req.body.address;
//             }
//           } catch (parseError) {
//             console.error("Error parsing address JSON:", parseError);
//             return res.status(400).json({ error: "Invalid address data format" });
//           }
//         } else {
//           loggedincustomer[key] = req.body[key];
//         }
//       });

//       // 4. Save updated customer
//       await loggedincustomer.save();

//       const now = moment().tz("Asia/Kolkata");

//       // ✅ Save notification with customerId
//       const notification = new notificationsModel({
//         notificationTitle: "customer updated",
//         message: `The customer titled "${
//           loggedincustomer.firstName || "Untitled"
//         }" has been updated successfully.`,
//         date: now.format("YYYY-MM-DD"),
//         time: now.format("hh:mm A"),
//         type: "success",
//         customerId: loggedincustomer._id, // ✅ store customerId internally
//       });

//       await notification.save();

//       // ✅ Do not expose customerId or sensitive fields in response
//       const safeCustomer = {
//         _id: loggedincustomer._id,
//         email: loggedincustomer.email,
//         firstName: loggedincustomer.firstName,
//         lastName: loggedincustomer.lastName,
//         profilePicture: loggedincustomer.profilePicture,
//         address: loggedincustomer.address,
//       };

//       res.status(200).json({
//         message: "Update successful",
//         customer: safeCustomer,
//       });
//     } catch (error) {
//       console.error("Error updating customer:", error);
//       res
//         .status(500)
//         .json({ error: error.message || "Something went wrong" });
//     }
//   }
// );


// CustomerRoute.put(
//   "/customer-update",
//   userAuth,
//   upload.single("profilePicture"),
//   async (req, res) => {
//     try {
//       const userId = req.customer?._id;
//       if (!userId) return res.status(401).json({ error: "Unauthorized" });

//       const customer = await CustomersModel.findById(userId);
//       if (!customer) return res.status(404).json({ error: "Customer not found" });

//       // ✅ Handle profile picture update
//       if (req.file) {
//         if (customer.profilePicture) {
//           const oldPath = path.join(
//             __dirname,
//             "..",
//             "storage",
//             "userdp",
//             customer.profilePicture
//           );
//           if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//         }
//         customer.profilePicture = req.file.filename;
//       }

//       // ✅ Handle other fields including address
//       Object.entries(req.body).forEach(([key, value]) => {
//         if (key === "address") {
//           let addresses =
//             typeof value === "string" ? JSON.parse(value) : value || [];

//           // ---- FIXED DEFAULT ADDRESS LOGIC ----
//           let defaultIndexes = addresses
//             .map((a, i) => (a.isDefault ? i : -1))
//             .filter((i) => i !== -1);

//           if (defaultIndexes.length === 0 && addresses.length > 0) {
//             // If no default is set, assign first one
//             addresses[0].isDefault = true;
//           } else if (defaultIndexes.length > 1) {
//             // If multiple defaults are set, keep only the first one
//             addresses = addresses.map((addr, i) => ({
//               ...addr,
//               isDefault: i === defaultIndexes[0],
//             }));
//           }

//           customer.address = addresses;
//         } else {
//           customer[key] = value;
//         }
//       });

//       await customer.save();

//       res.status(200).json({
//         message: "Update successful",
//         address: customer.address,
//         updates: customer,
//       });
//     } catch (err) {
//       console.error("Error updating customer:", err);
//       res
//         .status(500)
//         .json({ error: err.message || "Something went wrong" });
//     }
//   }
// );
CustomerRoute.put(
  "/customer-update",
  userAuth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.customer?._id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const customer = await CustomersModel.findById(userId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const { email, mobileNumber } = req.body;

      // ✅ Check if email already exists in another account
      if (email) {
        const emailExists = await CustomersModel.findOne({
          email: email,
          _id: { $ne: userId }, // exclude current user
        });
        if (emailExists) {
          return res.status(400).json({ error: "This email is already registered" });
        }
      }

      // ✅ Check if mobile number already exists in another account
      if (mobileNumber) {
        const mobileExists = await CustomersModel.findOne({
          mobileNumber: mobileNumber,
          _id: { $ne: userId }, // exclude current user
        });
        if (mobileExists) {
          return res
            .status(400)
            .json({ error: "This mobile number is already registered" });
        }
      }

      // ✅ Handle profile picture update
      if (req.file) {
        if (customer.profilePicture) {
          const oldPath = path.join(
            __dirname,
            "..",
            "storage",
            "userdp",
            customer.profilePicture
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        customer.profilePicture = req.file.filename;
      }

      // ✅ Handle other fields including address
      Object.entries(req.body).forEach(([key, value]) => {
        if (key === "address") {
          let addresses =
            typeof value === "string" ? JSON.parse(value) : value || [];

          // ---- FIXED DEFAULT ADDRESS LOGIC ----
          let defaultIndexes = addresses
            .map((a, i) => (a.isDefault ? i : -1))
            .filter((i) => i !== -1);

          if (defaultIndexes.length === 0 && addresses.length > 0) {
            addresses[0].isDefault = true;
          } else if (defaultIndexes.length > 1) {
            addresses = addresses.map((addr, i) => ({
              ...addr,
              isDefault: i === defaultIndexes[0],
            }));
          }

          customer.address = addresses;
        } else {
          customer[key] = value;
        }
      });

      await customer.save();

      res.status(200).json({
        message: "Update successful",
        address: customer.address,
        updates: customer,
      });
    } catch (err) {
      console.error("Error updating customer:", err);
      res.status(500).json({ error: err.message || "Something went wrong" });
    }
  }
);


CustomerRoute.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set to true if using HTTPS
  });
  res.status(200).json({ message: "Logged out successfully" });
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
      .json({ message: `Internal server error: ${error.message}` });
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

CustomerRoute.get("/get-logged-in-customer-details", userAuth, async (req, res) => {
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
