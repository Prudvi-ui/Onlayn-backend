// const express = require("express");
// const ProductRoute = express.Router();
// const productsModel = require("../../models/products");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { adminAuth } = require("../../middlewares/adminAuth");
// const { isValidObjectId } = require("../../utils/validation");
// const mongoose = require("mongoose");
// const csvParser = require("csv-parser");

// const storagePath = path.join(__dirname, "../../../src/storage/productimages");
// const csvStoragePath = path.join(__dirname, "../../../src/storage/csvfiles");

// // Ensure image and CSV folders exist
// if (!fs.existsSync(storagePath)) {
//   fs.mkdirSync(storagePath, { recursive: true });
//   console.log("Directory created:", storagePath);
// } else {
//   console.log("Directory already exists:", storagePath);
// }

// if (!fs.existsSync(csvStoragePath)) {
//   fs.mkdirSync(csvStoragePath, { recursive: true });
//   console.log("CSV Directory created:", csvStoragePath);
// } else {
//   console.log("CSV Directory already exists:", csvStoragePath);
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
//   limits: { fileSize: 1000000000 },
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
//   limits: { fileSize: 1000000000 },
// });



// // Get user's category
// ProductRoute.get("/one-category", adminAuth, async (req, res) => {
//   try {
//     const category = req.user;
//     res.send(category);
//   } catch (error) {
//     res.status(400).send("bad request");
//   }
// });

// // Get all products
// ProductRoute.get("/all-products",async (req, res) => {
//   try {
//     const product = await productsModel.find();
//     if (!product) throw new Error("products are not found");
//     res.send(product);
//   } catch (error) {
//     res.status(400).send("bad request");
//   }
// });

// // Count products
// ProductRoute.get("/count-products", async (req, res) => {
//   try {
//     const product = await productsModel.find();
//     if (!product || product.length === 0) {
//       return res.status(404).json({ message: "No products found", count: 0, product: [] });
//     }

//     res.json({ count: product.length, product });
//   } catch (error) {
//     console.error("Error fetching category count:", error);
//     res.status(400).json({ message: "Bad request" });
//   }
// });

// // Update product with multiple images
// ProductRoute.patch("/update-product", upload.array("images", 5),async (req, res) => {
//   try {
//     const productId = req.body._id;
//     if (!productId) return res.status(400).json({ error: "Product ID required" });
//     if (!isValidObjectId(productId)) return res.status(400).json({ error: "Invalid ID format" });

//     let product = await productsModel.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     Object.keys(req.body).forEach((key) => {
//       if (key !== "images") {
//         product[key] = req.body[key];
//       }
//     });

//     // Handle new image uploads
//     if (req.files && req.files.length > 0) {
//       if (product.images?.length) {
//         product.images.forEach((img) => {
//           const imgPath = path.join(storagePath, img);
//           if (fs.existsSync(imgPath)) {
//             fs.unlinkSync(imgPath);
//             console.log("✅ Old image deleted:", img);
//           }
//         });
//       }
//       product.images = req.files.map((file) => file.filename);
//     }

//     await product.save();
//     return res.json({ message: "Product updated successfully", product });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // Search product
// ProductRoute.get("/search-product", adminAuth, async (req, res) => {
//   try {
//     const findUser = await productsModel.findOne(req.body);
//     res.send(findUser);
//   } catch (error) {
//     res.status(500).json({ error: "product not found" });
//   }
// });

// // Bulk upload products from CSV
// ProductRoute.post("/bulk-upload-product",uploadCSV.single("csvFile"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "CSV file required" });

//     const filePath = req.file.path;
//     const products = [];

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

//         products.push(product);
//       })
//       .on("end", async () => {
//         try {
//           await productsModel.insertMany(products, { ordered: false });
//           res.json({ message: "Upload successful, products inserted" });
//         } catch (insertErr) {
//           console.error("Insert error:", insertErr);
//           res.status(500).json({ message: "Failed to insert some or all products", error: insertErr });
//         }
//       })
//       .on("error", (err) => {
//         console.error("CSV parse error:", err);
//         res.status(500).json({ message: "Failed to parse CSV file", error: err });
//       });
//   } catch (error) {
//     console.error("Error inserting products:", error);
//     res.status(500).json({ message: "Error processing CSV upload", error });
//   }
// });

// module.exports = ProductRoute;

const express = require("express");
const ProductRoute = express.Router();
const productsModel = require("../../models/products");
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

// ProductRoute.post("/create-products",upload.array("images", 5), async (req, res) => {
//   try {
//     // Parse the 'product' JSON string from the form-data
//     if (!req.body.product) {
//       return res.status(400).json({ message: "Product data (JSON string) is required in 'product' field." });
//     }
//     const productPayload = JSON.parse(req.body.product);

//     // Generate and assign unique shortId for the product
//     productPayload.shortId =`P${ await getNextShortIdNumber() }`;


//     // Prepare image URLs
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       imageUrls = req.files.map(file => /storage/productimages / `${ file.filename }`);
//     }

//     // Create a new product instance
//     const newProduct = new productsModel({
//       ...productPayload,
//       price: parseFloat(productPayload.price) || 0, // Ensure numbers, with fallback
//       margin: parseFloat(productPayload.margin) || 0, // Ensure numbers, with fallback
//       variants: productPayload.variants.map(v => ({
//         ...v,
//         discount: parseFloat(v.discount) || 0,
//         stock: parseInt(v.stock, 10) || 0,
//         reviews: Array.isArray(v.reviews)
//           ? v.reviews
//           : typeof v.reviews === 'string'
//             ? v.reviews.split(',').map(r => r.trim()).filter(Boolean)
//             : [],
//       })),
//       images: imageUrls,
//     });

//     await newProduct.save();

//     res.status(201).json({
//       message: "Product added successfully",
//       product: newProduct,
//     });
//   } catch (error) {
//     console.error("Error adding the product:", error);

//     if (error.name === "ValidationError") {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return res.status(400).json({
//         message: "Product validation failed",
//         errors: errors,
//       });
//     } else if (error.code === 11000) { // Duplicate key error (e.g., for productName or shortId if unique)
//       return res.status(409).json({
//         message: "A product with this name or ID already exists.",
//         error: error.message,
//       });
//     }

//     res.status(500).json({
//       message: "Server error while adding the product",
//       error: error.message,
//     });
//   }
// });

// Get user's category
ProductRoute.get("/one-category", adminAuth, async (req, res) => {
  try {
    const category = req.user;
    res.send(category);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

// Get all products
ProductRoute.get("/all-products", async (req, res) => {
  try {
    const product = await productsModel.find();
    if (!product) throw new Error("products are not found");
    res.send(product);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

// Count products
ProductRoute.get("/count-products", async (req, res) => {
  try {
    const product = await productsModel.find();
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No products found", count: 0, product: [] });
    }

    res.json({ count: product.length, product });
  } catch (error) {
    console.error("Error fetching category count:", error);
    res.status(400).json({ message: "Bad request" });
  }
});

// Update product with multiple images
ProductRoute.patch("/update-product", upload.array("images", 5), async (req, res) => {
  try {
    const productId = req.body._id;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    if (!isValidObjectId(productId)) return res.status(400).json({ error: "Invalid ID format" });

    let product = await productsModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

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
    return res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Search product
ProductRoute.get("/search-product", adminAuth, async (req, res) => {
  try {
    const findUser = await productsModel.findOne(req.body);
    res.send(findUser);
  } catch (error) {
    res.status(500).json({ error: "product not found" });
  }
});

// Bulk upload products from CSV
ProductRoute.post("/bulk-upload-product", uploadCSV.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

    const filePath = req.file.path;
    const products = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const price = parseFloat(row.price || "0");
        const margin = parseFloat(row.margin || "0");
        const discount = parseFloat(row.discount || "0");
        const size = parseFloat(row.size || "0");
        const stock = parseInt(row.stock || "0");
        const unit = row.unit?.trim();

        const product = {
          productName: row.productName?.trim() || "Unnamed Product",
          Description: row.Description?.trim() || "",
          price,
          margin,
          category: row.category?.trim() || "Uncategorized",
          brand: row.brand?.trim() || "Unknown",
          urlKey: row.urlKey?.trim() || "",
          metaTitle: row.metaTitle?.trim() || "",
          metaKeyword: row.metaKeyword?.trim() || "",
          metaDescription: row.metaDescription?.trim() || "",
          variants: [
            {
              unit,
              size,
              discount,
              stock,
            },
          ],
          images: row.images
            ? row.images.split(",").map((img) => img.trim())
            : [],
        };

        products.push(product);
      })
      .on("end", async () => {
        try {
          await productsModel.insertMany(products, { ordered: false });
          res.json({ message: "Upload successful, products inserted" });
        } catch (insertErr) {
          console.error("Insert error:", insertErr);
          res.status(500).json({ message: "Failed to insert some or all products", error: insertErr });
        }
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        res.status(500).json({ message: "Failed to parse CSV file", error: err });
      });
  } catch (error) {
    console.error("Error inserting products:", error);
    res.status(500).json({ message: "Error processing CSV upload", error });
  }
});

module.exports = ProductRoute;