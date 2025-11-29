const express = require("express");
const ComingsoonRoute = express.Router();
const Comingsoon = require("../../models/Comingsoon");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { adminAuth } = require("../../middlewares/adminAuth");
const { isValidObjectId } = require("../../utils/validation");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");

const storagePath = path.join(__dirname, "../../storage/productimages");
const csvStoragePath = path.join(__dirname, "../../../src/storage/csvfiles");

// Ensure image and CSV folders exist
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log("Directory created:", storagePath);
} else {
  console.log("Directory already exists:", storagePath);
}

if (!fs.existsSync(csvStoragePath)) {
  fs.mkdirSync(csvStoragePath, { recursive: true });
  console.log("CSV Directory created:", csvStoragePath);
} else {
  console.log("CSV Directory already exists:", csvStoragePath);
}

// Image multer config
const imageconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storagePath);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: imageconfig,
  limits: { fileSize: 1000000000 },
});

// CSV multer config
const csvConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, csvStoragePath);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadCSV = multer({
  storage: csvConfig,
  limits: { fileSize: 1000000000 },
});

ComingsoonRoute.post("/create-Comingsoon", upload.array("images", 5), async (req, res) => {
  try {
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.filename);
    } else {
      req.body.images = "";
      console.log("⚠ No file uploaded");
    }

    const product = new Comingsoon(req.body);
    await product.save();

    res.json({ message: "Comingsoon added successfully", product });
  } catch (error) {
    console.error("Error adding the Comingsoon:", error);
    res.status(400).json({ message: "Error adding the Comingsoon", error });
  }
});

// Get user's category
ComingsoonRoute.get("/one-category", adminAuth, async (req, res) => {
  try {
    const category = req.user;
    res.send(category);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

// Get all products
ComingsoonRoute.get("/all-Comingsoon", async (req, res) => {
  try {
    const product = await Comingsoon.find();
    if (!product) throw new Error("Comingsoon are not found");
    res.send(product);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

// Count products
ComingsoonRoute.get("/count-Comingsoon", async (req, res) => {
  try {
    const product = await Comingsoon.find();
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No Comingsoon found", count: 0, product: [] });
    }

    res.json({ count: product.length, product });
  } catch (error) {
    console.error("Error fetching category count:", error);
    res.status(400).json({ message: "Bad request" });
  }
});

// Update product with multiple images
ComingsoonRoute.patch("/update-Comingsoon", upload.array("images", 5), async (req, res) => {
  try {
    const productId = req.body._id;
    if (!productId) return res.status(400).json({ error: "Comingsoon ID required" });
    if (!isValidObjectId(productId)) return res.status(400).json({ error: "Invalid ID format" });

    let product = await Comingsoon.findById(productId);
    if (!product) return res.status(404).json({ error: "Comingsoon not found" });

    Object.keys(req.body).forEach((key) => {
      if (key !== "images") {
        product[key] = req.body[key];
      }
    });

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      if (product.images?.length) {
        product.images.forEach((img) => {
          const imgPath = path.join(storagePath, img);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
            console.log("✅ Old image deleted:", img);
          }
        });
      }
      product.images = req.files.map((file) => file.filename);
    }

    await product.save();
    return res.json({ message: "Comingsoon updated successfully", product });
  } catch (error) {
    console.error("Error updating Comingsoon:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Search product
ComingsoonRoute.get("/search-Comingsoon", adminAuth, async (req, res) => {
  try {
    const findUser = await Comingsoon.findOne(req.body);
    res.send(findUser);
  } catch (error) {
    res.status(500).json({ error: "Comingsoon not found" });
  }
});

// Bulk upload Comingsoon from CSV
// ComingsoonRoute.post("/bulk-upload-Comingsoon", uploadCSV.single("csvFile"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "CSV file required" });

//     const filePath = req.file.path;
//     const Comingsoon = [];

//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on("data", (row) => {
//         const price = parseFloat(row.price || "0");
//         const margin = parseFloat(row.margin || "0");
//         const discount = parseFloat(row.discount || "0");
//         const size = parseFloat(row.size || "0");
//         const stock = parseInt(row.stock || "0");
//         const unit = row.unit?.trim();

//         const product = {
//           productName: row.productName?.trim() || "Unnamed Product",
//           Description: row.Description?.trim() || "",
//           price,
//           margin,
//           category: row.category?.trim() || "Uncategorized",
//           brand: row.brand?.trim() || "Unknown",
//           urlKey: row.urlKey?.trim() || "",
//           metaTitle: row.metaTitle?.trim() || "",
//           metaKeyword: row.metaKeyword?.trim() || "",
//           metaDescription: row.metaDescription?.trim() || "",
//           variants: [
//             {
//               unit,
//               size,
//               discount,
//               stock,
//             },
//           ],
//           images: row.images
//             ? row.images.split(",").map((img) => img.trim())
//             : [],
//         };

//         Comingsoon.push(product);
//       })
//       .on("end", async () => {
//         try {
//           await Comingsoon.insertMany(Comingsoon, { ordered: false });
//           res.json({ message: "Upload successful, Comingsoon inserted" });
//         } catch (insertErr) {
//           console.error("Insert error:", insertErr);
//           res.status(500).json({ message: "Failed to insert some or all Comingsoon", error: insertErr });
//         }
//       })
//       .on("error", (err) => {
//         console.error("CSV parse error:", err);
//         res.status(500).json({ message: "Failed to parse CSV file", error: err });
//       });
//   } catch (error) {
//     console.error("Error inserting Comingsoon:", error);
//     res.status(500).json({ message: "Error processing CSV upload", error });
//   }
// });

module.exports = ComingsoonRoute;