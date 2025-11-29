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
const csvStoragePath = path.join(__dirname, "../../storage/csvfiles"); // Corrected path for CSV

// Ensure image and CSV folders exist
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

if (!fs.existsSync(csvStoragePath)) {
  fs.mkdirSync(csvStoragePath, { recursive: true });
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
  limits: { fileSize: 1000000 }, // 1MB file size limit
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
  limits: { fileSize: 1000000 }, // 1MB file size limit
});

// 1. Create a new coming soon product
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

// 2. Get all coming soon products
ComingsoonRoute.get("/all-Comingsoon", async (req, res) => {
  try {
    const products = await Comingsoon.find({}, 'shortId productName images');
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});



// 3. Update a coming soon product
// ComingsoonRoute.put("/update-product/:id", upload.single("productImage"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { productName } = req.body;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ success: false, message: "Invalid product ID format." });
//     }

//     const product = await Comingsoon.findById(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found." });
//     }

//     if (productName) {
//       product.productName = productName;
//     }

//     if (req.file) {
//       const oldImagePath = path.join(storagePath, product.productImage);
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//       }
//       product.productImage = req.file.filename;
//     }

//     await product.save();
//     res.json({ success: true, message: "Product updated successfully.", products: product });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ success: false, message: "Error updating product." });
//   }
// });

ComingsoonRoute.put("/update-product/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { productName } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    const product = await Comingsoon.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (productName) {
      product.productName = productName;
    }

    if (req.files && req.files.length > 0) {
      // Optional: Delete old images
      for (const img of product.images) {
        const oldImagePath = path.join(storagePath, img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.images = req.files.map((file) => file.filename);
    }

    await product.save();
    res.json({ success: true, message: "Product updated successfully.", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product." });
  }
});



// 4. Delete a coming soon product
// ComingsoonRoute.delete("/delete-product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ success: false, message: "Invalid product ID format." });
//     }

//     const product = await Comingsoon.findByIdAndDelete(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found." });
//     }

//     const imagePath = path.join(storagePath, product.productImage);
//     if (fs.existsSync(imagePath)) {
//       fs.unlink(imagePath, (err) => {
//         if (err) console.error("Failed to delete product image:", err);
//       });
//     }

//     res.json({ success: true, message: "Product deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({ success: false, message: "Error deleting product." });
//   }
// });

ComingsoonRoute.delete("/delete-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    const product = await Comingsoon.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Safe image deletion
    if (product.images) {
      try {
        const imagePath = path.join(storagePath, product.images);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("✅ Image deleted:", product.images);
        } else {
          console.log("⚠️ Image file not found:", imagePath);
        }
      } catch (fileErr) {
        console.error("❌ Failed to delete image file:", fileErr.message);
        // Don’t throw here — just log it
      }
    }

    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ success: false, message: "Error deleting product." });
  }
});



// ComingsoonRoute.put("/update-Comingsoon/:productId", upload.single("image"), async (req, res) => {
//     try {
//         const productId = req.params.productId;
//         if (!isValidObjectId(productId)) {
//             return res.status(400).json({ error: "Invalid ID format" });
//         }

//         let product = await Comingsoon.findById(productId);
//         if (!product) {
//             return res.status(404).json({ error: "Comingsoon not found" });
//         }

//         // Handle text data updates, explicitly excluding the 'image' field
//         Object.keys(req.body).forEach((key) => {
//             if (key !== 'image') { // <-- Add this check to prevent overwriting
//                 product[key] = req.body[key];
//             }
//         });

//         // Handle single image upload
//         if (req.file) {
//             // Delete old image if it exists
//             if (product.images) {
//                 const imgPath = path.join(storagePath, product.images);
//                 if (fs.existsSync(imgPath)) {
//                     fs.unlinkSync(imgPath);
//                     console.log("✅ Old image deleted:", product.images);
//                 }
//             }
//             product.images = req.file.filename; // Set new filename
//         }

//         await product.save();
//         return res.json({ message: "Comingsoon updated successfully", product });

//     } catch (error) {
//         console.error("❌ Error updating Comingsoon:", error);
//         return res.status(500).json({ error: "Something went wrong" });
//     }
// });

// 5. Bulk upload products from CSV
ComingsoonRoute.post("/bulk-upload-Comingsoon", uploadCSV.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const filePath = req.file.path;
    const productsToInsert = [];

    // Use a read stream to process the CSV data
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // Create a new object with only the productName field
        const product = {
          productName: row.productName?.trim() || "Unnamed Product",
        };
        productsToInsert.push(product);
      })
      .on("end", async () => {
        try {
          // Use the Mongoose model to insert the new data
          await Comingsoon.insertMany(productsToInsert, { ordered: false });
          res.json({ message: "Upload successful, products inserted" });
        } catch (insertErr) {
          console.error("Insert error:", insertErr);
          res.status(500).json({ message: "Failed to insert products", error: insertErr });
        }
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        res.status(500).json({ message: "Failed to parse CSV file", error: err });
      });
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    res.status(500).json({ message: "Error processing CSV upload", error });
  }
});

module.exports = ComingsoonRoute;




// const express = require("express");
// const ComingsoonRoute = express.Router();
// const Comingsoon = require("../../models/Comingsoon");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { adminAuth } = require("../../middlewares/adminAuth");
// const { isValidObjectId } = require("../../utils/validation");
// const mongoose = require("mongoose");
// const csvParser = require("csv-parser");

// const storagePath = path.join(__dirname, "../../storage/productimages");
// const csvStoragePath = path.join(__dirname, "../../storage/csvfiles"); // Corrected path for CSV

// // Ensure image and CSV folders exist
// if (!fs.existsSync(storagePath)) {
//   fs.mkdirSync(storagePath, { recursive: true });
// }

// if (!fs.existsSync(csvStoragePath)) {
//   fs.mkdirSync(csvStoragePath, { recursive: true });
// }

// // Image multer config
// const imageconfig = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, storagePath);
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({
//   storage: imageconfig,
//   limits: { fileSize: 1000000 }, // 1MB file size limit
// });

// // CSV multer config
// const csvConfig = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, csvStoragePath);
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const uploadCSV = multer({
//   storage: csvConfig,
//   limits: { fileSize: 1000000 }, // 1MB file size limit
// });

// // 1. Create a new coming soon product
// ComingsoonRoute.post("/create-Comingsoon", upload.array("images", 5), async (req, res) => {
//   try {
//     if (req.files && req.files.length > 0) {
//       req.body.images = req.files.map((file) => file.filename);
//     } else {
//       req.body.images = [];
//       console.log("⚠ No file uploaded");
//     }

//     const product = new Comingsoon(req.body);
//     await product.save();

//     res.json({ message: "Comingsoon added successfully", product });
//   } catch (error) {
//     console.error("Error adding the Comingsoon:", error);
//     res.status(400).json({ message: "Error adding the Comingsoon", error });
//   }
// });

// // 2. Get all coming soon products
// ComingsoonRoute.get("/products", async (req, res) => {
//   try {
//     const products = await Comingsoon.find({}, 'shortId productName images');
//     res.json({ success: true, products });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ success: false, message: "Error fetching products" });
//   }
// });

// // 3. Update a coming soon product
// ComingsoonRoute.put("/update-product/:id", upload.array("images", 5), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { productName } = req.body;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ success: false, message: "Invalid product ID format." });
//     }

//     const product = await Comingsoon.findById(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found." });
//     }

//     if (productName) {
//       product.productName = productName;
//     }

//     if (req.files && req.files.length > 0) {
//       // Delete old images
//       if (product.images) {
//         for (const img of product.images) {
//           const oldImagePath = path.join(storagePath, img);
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath);
//           }
//         }
//       }

//       product.images = req.files.map((file) => file.filename);
//     }

//     await product.save();
//     res.json({ success: true, message: "Product updated successfully.", product });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ success: false, message: "Error updating product." });
//   }
// });

// // 4. Delete a coming soon product
// ComingsoonRoute.delete("/delete-product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ success: false, message: "Invalid product ID format." });
//     }

//     const product = await Comingsoon.findByIdAndDelete(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found." });
//     }

//     // Correctly delete image files from storage
//     if (product.images && Array.isArray(product.images)) {
//       for (const img of product.images) {
//         const imagePath = path.join(storagePath, img);
//         if (fs.existsSync(imagePath)) {
//           fs.unlinkSync(imagePath);
//           console.log("✅ Image deleted:", img);
//         }
//       }
//     }

//     res.json({ success: true, message: "Product deleted successfully." });
//   } catch (error) {
//     console.error("❌ Error deleting product:", error);
//     res.status(500).json({ success: false, message: "Error deleting product." });
//   }
// });

// // 5. Bulk upload products from CSV
// ComingsoonRoute.post(
//   "/bulk-upload-Comingsoon",
//   uploadCSV.single("csvFile"),
//   async (req, res) => {
//     try {
//       if (!req.file) return res.status(400).json({ message: "CSV file required" });

//       const filePath = req.file.path;
//       const products = []; // ✅ use products array, not Comingsoon

//       fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on("data", (row) => {
//           if (row.productName) {
//             products.push({ productName: row.productName.trim() });
//           }
//         })
//         .on("end", async () => {
//           try {
//             if (products.length === 0) {
//               return res.status(400).json({ message: "No valid productName found in CSV" });
//             }

//             // ✅ insert into DB using Mongoose model
//             await ComingsoonModel.insertMany(products, { ordered: false });

//             res.json({
//               message: "Upload successful",
//               insertedCount: products.length,
//             });
//           } catch (insertErr) {
//             console.error("Insert error:", insertErr);
//             res.status(500).json({
//               message: "Failed to insert products",
//               error: insertErr,
//             });
//           }
//         })
//         .on("error", (err) => {
//           console.error("CSV parse error:", err);
//           res.status(500).json({ message: "Failed to parse CSV file", error: err });
//         });
//     } catch (error) {
//       console.error("Error inserting products:", error);
//       res.status(500).json({ message: "Error processing CSV upload", error });
//     }
//   }
// );

// module.exports = ComingsoonRoute;