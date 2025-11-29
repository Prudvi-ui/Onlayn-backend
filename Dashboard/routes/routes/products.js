const express = require("express");
const ProductRoute = express.Router();
const productsModel = require("../../models/products");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { adminAuth } = require("../../middlewares/adminAuth");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");
const moment = require("moment");
const notificationsModel = require("../../models/notifications");

// --- File Storage Paths ---
const productImagesStoragePath = path.join(
  __dirname,
  "../../storage/productimages"
);
const csvUploadsTempPath = path.join(__dirname, "../../storage/csvUploadsTemp");

// Ensure image and CSV folders exist
if (!fs.existsSync(productImagesStoragePath)) {
  fs.mkdirSync(productImagesStoragePath, { recursive: true });
  console.log("Directory created:", productImagesStoragePath);
} else {
  console.log("Directory already exists:", productImagesStoragePath);
}

if (!fs.existsSync(csvUploadsTempPath)) {
  fs.mkdirSync(csvUploadsTempPath, { recursive: true });
  console.log("CSV Temp Directory created:", csvUploadsTempPath);
} else {
  console.log("CSV Temp Directory already exists:", csvUploadsTempPath);
}

// --- Multer Configurations ---

// Image multer config
const productImageStorageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, productImagesStoragePath);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});
const uploadImage = multer({
  storage: productImageStorageConfig,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// CSV multer config
const csvStorageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, csvUploadsTempPath);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-bulk-upload-" + file.originalname);
  },
});
const uploadCSV = multer({
  storage: csvStorageConfig,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed!"), false);
    }
  },
});

// --- Utility to get the next available shortId number ---
async function getNextShortIdNumber() {
  let nextIdNum = 1;
  try {
    const lastProduct = await productsModel
      .findOne({})
      .sort({ shortId: -1 })
      .select("shortId")
      .exec();

    if (lastProduct && lastProduct.shortId) {
      const match = lastProduct.shortId.match(/^P(\d+)$/);
      if (match && match[1]) {
        nextIdNum = parseInt(match[1]) + 1;
      }
    }
  } catch (error) {
    console.error("Error fetching next shortId number:", error);
  }
  return nextIdNum;
}

// ====================================================================
// 1. Create Product API (POST)
// Endpoint: /create-products
// ====================================================================
ProductRoute.post(
  "/create-products",
  adminAuth,
  uploadImage.array("images", 5),
  async (req, res) => {
    try {
      // Parse the 'product' JSON string from the form-data
      if (!req.body.product) {
        return res.status(400).json({
          message: "Product data (JSON string) is required in 'product' field.",
        });
      }
      const productPayload = JSON.parse(req.body.product);

      // Generate and assign unique shortId for the product
      productPayload.shortId = `P${await getNextShortIdNumber()}`;

      // Prepare image filenames
      let imageFilenames = [];
      if (req.files && req.files.length > 0) {
        imageFilenames = req.files.map((file) => file.filename);
      }

      // Create a new product instance, ensuring data types are correct
      const newProduct = new productsModel({
        ...productPayload,
        price: parseFloat(productPayload.price) || 0,
        margin: parseFloat(productPayload.margin) || 0,
        discount: parseFloat(productPayload.discount) || 0,
        stock: parseInt(productPayload.stock, 10) || 0,
        images: imageFilenames,
      });

      await newProduct.save();

      const now = moment();
      const newNotification = new notificationsModel({
        notificationTitle: "product created",
        message: `The product titled "${
          newProduct.productName
        }" has been successfully created.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
      });

      await newNotification.save();
      res.status(201).json({
        message: "Product added successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Error adding the product:", error);

      if (error.name === "ValidationError") {
        const errors = {};
        for (let field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return res.status(400).json({
          message: "Product validation failed",
          errors: errors,
        });
      } else if (error.code === 11000) {
        return res.status(409).json({
          message: "A product with this name or ID already exists.",
          error: error.message,
        });
      }

      res.status(500).json({
        message: "Server error while adding the product",
        error: error.message,
      });
    }
  }
);

// ====================================================================
// 2. Update Product API (PUT)
// Endpoint: /update-product/:id
// ====================================================================
ProductRoute.put(
  "/update-product/:id",
  adminAuth,
  uploadImage.array("images", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format." });
      }

      if (!req.body.product) {
        return res.status(400).json({ message: "Product data is required." });
      }

      const productPayload = JSON.parse(req.body.product);
      
      const existingProduct = await productsModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found." });
      }

      let newImageFilenames = [];
      if (req.files && req.files.length > 0) {
        // New images were uploaded, so we replace the old ones
        // First, delete old images from the file system
        existingProduct.images.forEach(filename => {
          const imgPath = path.join(productImagesStoragePath, filename);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
            console.log("✅ Old image deleted from disk:", imgPath);
          }
        });
        newImageFilenames = req.files.map(file => file.filename);
      } else {
        // No new images were uploaded, so we keep the existing ones
        newImageFilenames = existingProduct.images;
      }

      const updatedProductData = {
        ...productPayload,
        price: parseFloat(productPayload.price) || 0,
        margin: parseFloat(productPayload.margin) || 0,
        discount: parseFloat(productPayload.discount) || 0,
        stock: parseInt(productPayload.stock, 10) || 0,
        images: newImageFilenames,
      };

      const updatedProduct = await productsModel.findByIdAndUpdate(
        id,
        { $set: updatedProductData },
        { new: true, runValidators: true }
      );

      const now = moment();
      const newNotification = new notificationsModel({
        notificationTitle: "product updated",
        message: `The product titled "${
          updatedProduct.productName
        }" has been successfully updated.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
      });

      await newNotification.save();

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating the product:", error);

      if (error.name === "ValidationError") {
        const errors = {};
        for (let field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return res.status(400).json({
          message: "Product validation failed",
          errors: errors,
        });
      } else if (error.code === 11000) {
        return res.status(409).json({
          message: "A product with this name or ID already exists.",
          error: error.message,
        });
      }

      res.status(500).json({
        message: "Server error while updating the product",
        error: error.message,
      });
    }
  }
);

// ====================================================================
// 3. Delete Product API (DELETE)
// Endpoint: /delete-product/:id
// ====================================================================
ProductRoute.delete("/delete-product/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const deletedProduct = await productsModel.findById(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete associated images from file system
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      deletedProduct.images.forEach((filename) => {
        // CORRECTED: Use filename directly
        const imgPath = path.join(productImagesStoragePath, filename);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
          console.log("✅ Image deleted from disk:", imgPath);
        } else {
          console.warn(
            "⚠️ Image not found on disk (skipping deletion):",
            imgPath
          );
        }
      });
    }

    // Now delete the product from the database
    await productsModel.findByIdAndDelete(id);
    const now = moment();

    const newNotification = new notificationsModel({
      notificationTitle: "product deleted",
      message: `The product titled "${
        deletedProduct.productName
      }" has been successfully deleted.`,
      date: now.format("YYYY-MM-DD"),
      time: now.format("h:mm A"),
      source: "dashboard",
    });

    await newNotification.save();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid Product ID provided." });
    }
    res
      .status(500)
      .json({ error: "Error deleting the product", details: error.message });
  }
});

// ====================================================================
// 4. Update Stock API (PUT)
// Endpoint: /update-stock
// ====================================================================
// ✅ THIS IS THE CORRECT, ATOMIC CODE
// ✅ CORRECT AND ATOMIC STOCK UPDATE
ProductRoute.put("/update-stock", adminAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid Product ID." });
    }

    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number." });
    }

    // 🔍 Fetch product first
    const product = await productsModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (typeof product.stock !== "number") {
      return res.status(400).json({ error: "Product stock is not set properly in DB." });
    }

    if (product.stock < qty) {
      return res.status(400).json({ error: `Not enough stock. Only ${product.stock} remaining.` });
    }

    // ✅ Reduce stock
    product.stock -= qty;
    await product.save();

    return res.status(200).json({
      message: "Product stock updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return res.status(500).json({
      error: "Something went wrong during stock update",
      details: error.message,
    });
  }
});
// ====================================================================
// 5. Get All Products API (GET)
// Endpoint: /all-products
// ====================================================================
ProductRoute.get("/all-products", async (req, res) => {
  try {
    const products = await productsModel.find({});
    res.json({ message: "Products retrieved successfully", products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      message: "Server error while retrieving products.",
      error: error.message,
    });
  }
});


ProductRoute.get("/count-products", adminAuth, async (req, res) => {
  try {
    const count = await productsModel.countDocuments();
    res.json({ message: "Products count retrieved successfully.", count });
  } catch (error) {
    console.error("Error retrieving product count:", error);
    res.status(500).json({
      message: "Server error while retrieving product count.",
      error: error.message,
    });
  }
});

// ====================================================================
// 6. Get Product by ID API (GET)
// Endpoint: /product/:id
// ====================================================================
ProductRoute.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    const product = await productsModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product retrieved successfully", product });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({
      message: "Server error while retrieving product.",
      error: error.message,
    });
  }
});

module.exports = ProductRoute;
// ProductRoute.put("/update-stock", adminAuth, async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;

//     // Basic validation
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: "Invalid Product ID." });
//     }
//     if (typeof quantity !== "number" || quantity <= 0) {
//       return res.status(400).json({ error: "Quantity must be a positive number." });
//     }

//     const product = await productsModel.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found." });
//     }

//     const variantToUpdate = product.variants[0];

//     if (!variantToUpdate) {
//       return res.status(404).json({ error: "No variants found for this product." });
//     }

//     // Check if there is enough stock in the variant
//     if (variantToUpdate.stock < quantity) {
//       return res.status(400).json({ error: "Not enough stock in the variant to fulfill this request." });
//     }

//     // Atomically update the stock field of the first variant by the specific quantity
//     const updateResult = await productsModel.updateOne(
//       { "_id": productId, "variants._id": variantToUpdate._id },
//       { "$inc": { "variants.$.stock": -quantity } } // Correctly decrements by the requested quantity
//     );

//     // After a successful update, we check if the document was modified.
//     if (updateResult.modifiedCount === 0) {
//         return res.status(400).json({ error: "Stock was not updated, possibly due to a race condition or data mismatch." });
//     }

//     // Fetch the updated product to send back in the response
//     const updatedProduct = await productsModel.findById(productId);

//     res.status(200).json({ message: "Product stock updated successfully.", product: updatedProduct });
//   } catch (error) {
//     console.error("Error updating product stock:", error);
//     res.status(500).json({ error: "An unexpected error occurred during stock update." });
//   }
// });
// ====================================================================
// 6. Search Product API (GET)
// Endpoint: /search-product
// Query Params: ?productName=... or ?category=... etc.
// ====================================================================

// PUT /Dashboard/products/update-stock
// ProductRoute.put("/update-stock", adminAuth, async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;

//     // --- Validate ---
//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: "Invalid Product ID." });
//     }
//     const qty = parseInt(quantity, 10);
//     if (!Number.isFinite(qty) || qty <= 0) {
//       return res.status(400).json({ error: "Quantity must be a positive number." });
//     }

//     // --- Find and update the product stock ---
//     const product = await productsModel.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found." });
//     }

//     // Check if there's enough stock
//     if (product.stock < qty) {
//       return res.status(400).json({ error: `Not enough stock. Only ${product.stock} remaining.` });
//     }

//     // Deduct the stock
//     product.stock -= qty;

//     // --- Save the updated product ---
//     const updatedProduct = await product.save();

//     return res.status(200).json({
//       message: "Product stock updated successfully.",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product stock:", error);
//     return res.status(500).json({
//       error: "Something went wrong during stock update",
//       details: error.message,
//     });
//   }
// });

ProductRoute.put("/update-stock", adminAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // --- Validate ---
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid Product ID." });
    }
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number." });
    }

    // --- Find and atomically update the product stock ---
    // The $inc operator is an atomic operation that increments/decrements a field
    // It prevents race conditions by modifying the value in a single, server-side step.
    const updatedProduct = await productsModel.findOneAndUpdate(
      { _id: productId, stock: { $gte: qty } }, // Find the product and check if stock is sufficient
      { $inc: { stock: -qty } }, // Atomically decrement the stock by the ordered quantity
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      // If `updatedProduct` is null, it means either the product wasn't found
      // or the stock was insufficient. We can check for a more specific error.
      const product = await productsModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      } else {
        return res.status(400).json({ error: `Not enough stock. Only ${product.stock} remaining.` });
      }
    }

    return res.status(200).json({
      message: "Product stock updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return res.status(500).json({
      error: "Something went wrong during stock update",
      details: error.message,
    });
  }
});

ProductRoute.get("/check-stock-notifications", adminAuth, async (req, res) => {
  try {
    const STOCK_THRESHOLD = 5; 
    const products = await productsModel.find({});
    let notificationsCreated = 0;

    for (const product of products) {
      if (product.stock <= STOCK_THRESHOLD) { // Changed from <= to ===
        // Check if a notification for this specific product ID already exists
        const existingNotification = await notificationsModel.findOne({
          productId: product._id,
        });

        if (!existingNotification) {
          const now = moment();
          const outOfStockNotification = new notificationsModel({
            notificationTitle: "Out of Stock Alert",
            message: `Out of stock alert for "${product.productName}". Remaining stock: ${product.stock}.`,
            date: now.format("YYYY-MM-DD"),
            time: now.format("h:mm A"),
            source: "dashboard",
            productId: product._id, // Add the product ID
          });
          await outOfStockNotification.save();
          notificationsCreated++;
        }
      }
    }

    return res.status(200).json({
    //   message: `Stock check complete. Created ${notificationsCreated} new out-of-stock notifications.`,
      notificationsCreated,
    });
  } catch (error) {
    console.error("Error checking for out-of-stock products:", error);
    return res.status(500).json({
      error: "Something went wrong during stock check",
      details: error.message,
    });
  }
});

ProductRoute.get("/search-product", async (req, res) => {
  try {
    const query = {};
    // Build query based on parameters in req.query
    if (req.query.productName) {
      query.productName = { $regex: req.query.productName, $options: "i" }; // Case-insensitive search
    }
    if (req.query.category) {
      query.category = { $regex: req.query.category, $options: "i" };
    }
    if (req.query.brand) {
      query.brand = { $regex: req.query.brand, $options: "i" };
    }
    // Add more search fields as needed

    const products = await productsModel.find(query);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching your search criteria." });
    }

    res.json({ products: products });
  } catch (error) {
    console.error("Error searching products:", error);
    res
      .status(500)
      .json({
        error: "Server error during product search",
        details: error.message,
      });
  }
});

// ====================================================================
// 7. Bulk Upload Products via CSV API (POST)
// Endpoint: /bulk-upload-product
async function getNextShortIdNumber() {
  try {
    // Find the product with the highest shortId that matches the P#### format
    const lastProduct = await productsModel
      .findOne({
        shortId: { $regex: /^P\d{4}$/ }, // Regex to match 'P' followed by exactly 4 digits
      })
      .sort({ shortId: -1 })
      .select("shortId")
      .lean();

    let nextNum = 1001; // Default starting shortId for the first product (P1001)

    if (lastProduct && lastProduct.shortId) {
      // Extract the number part from the shortId (e.g., '1001' from 'P1001')
      const currentNumStr = lastProduct.shortId.substring(1); // Remove 'P'
      const currentNum = parseInt(currentNumStr);

      if (!isNaN(currentNum)) {
        nextNum = currentNum + 1;
      }
    }
    return nextNum;
  } catch (error) {
    console.error("Error getting next shortId number:", error);
    return 1001; // Fallback in case of error
  }
}

// ====================================================================
// Bulk Upload Product API (POST)
// Endpoint: /bulk-upload-product
// ====================================================================
ProductRoute.post(
  "/bulk-upload-product",
  adminAuth,
  uploadCSV.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "CSV file required" });
      }

      const filePath = req.file.path;
      const productsToProcess = [];
      let rowCount = 0;

      // Get the starting shortId number once before processing the batch
      let currentShortIdNum = await getNextShortIdNumber();

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            rowCount++;
            // Skip empty rows
            const isEmptyRow = Object.values(row).every(
              (value) => !value || String(value).trim() === ""
            );
            if (isEmptyRow) {
              return;
            }

            // Parse and clean up data types
            const price = parseFloat(row.price || "0");
            const margin = parseFloat(row.margin || "0");
            const discount = parseFloat(row.discount || "0");
            const stock = parseInt(row.stock || "0");
            const reviews = row.reviews
              ?.split(",")
              .map((r) => r.trim())
              .filter(Boolean) || [];
            
            // Create a single, flattened product object
            const productData = {
              productName: row.productName?.trim() || `Unnamed Product ${Date.now()}-${rowCount}`,
              description: row.description?.trim() || "",
              price: price,
              margin: margin,
              category: row.category?.trim() || "Uncategorized",
              brand: row.brand?.trim() || "Unknown",
              metaTitle: row.metaTitle?.trim() || "",
              metaKeyword: row.metaKeyword?.trim() || "",
              metaDescription: row.metaDescription?.trim() || "",
              unit: row.unit?.trim() || "",
              size: row.size?.trim() || "",
              discount: discount,
              stock: stock,
              material: row.material?.trim() || "",
              color: row.color?.trim() || "",
              age: row.age?.trim() || "",
              reviews: reviews,
            };
            productsToProcess.push(productData);
          })
          .on("end", () => {
            resolve();
          })
          .on("error", (err) => {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting CSV file:", unlinkErr);
            });
            reject(new Error(`Failed to parse CSV file: ${err.message}`));
          });
      });

      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting CSV file:", err);
      });

      let insertedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      const failedProducts = [];

      for (const productData of productsToProcess) {
        try {
          // Check for an existing product by name
          let existingProduct = await productsModel.findOne({
            productName: productData.productName,
          });

          if (existingProduct) {
            // If product exists, update it
            await productsModel.updateOne(
              { _id: existingProduct._id },
              { $set: productData },
              { runValidators: true }
            );
            updatedCount++;
          } else {
            // If it's a new product, create it with a new shortId
            const formattedShortId = `P${String(currentShortIdNum).padStart(
              4,
              "0"
            )}`;
            productData.shortId = formattedShortId;
            currentShortIdNum++;
            await productsModel.create(productData);
            insertedCount++;
          }
        } catch (docError) {
          errorCount++;
          failedProducts.push({
            productName: productData.productName,
            error: docError.message || "Unknown error",
          });
          console.error(`Error processing product ${productData.productName}:`, docError);
        }
      }

      // Create a single notification for the bulk upload result
      const now = moment();
      const newNotification = new notificationsModel({
        notificationTitle: "bulk upload complete",
        message: `Bulk product upload finished. ${insertedCount} new products created, ${updatedCount} products updated, and ${errorCount} products failed.`,
        date: now.format("YYYY-MM-DD"),
        time: now.format("h:mm A"),
        source: "dashboard",
      });
      await newNotification.save();
      
      let message = `Bulk upload complete: ${insertedCount} inserted, ${updatedCount} updated.`;
      if (errorCount > 0) {
        message += ` ${errorCount} products failed.`;
        return res.status(207).json({
          message,
          summary: {
            inserted: insertedCount,
            updated: updatedCount,
            failed: errorCount,
          },
          errors: failedProducts,
        });
      }

      res.json({
        message,
        summary: {
          inserted: insertedCount,
          updated: updatedCount,
          failed: errorCount,
        },
      });
    } catch (error) {
      console.error("Error during CSV upload process:", error);
      res
        .status(500)
        .json({ message: "Error processing CSV upload", error: error.message });
    }
  }
);

module.exports = ProductRoute;


