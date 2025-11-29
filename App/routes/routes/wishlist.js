const express = require("express");
const wishlist = express.Router();
const wishlistModel = require("../../models/wishlist");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { adminAuth } = require("../../middlewares/adminAuth");
const { isValidObjectId } = require("../../utils/validation");
const mongoose = require("mongoose");
const csvParser = require("csv-parser");

const storagePath = path.join(__dirname, "../../storage/wishlistimages");
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

wishlist.post("/create-wishlist", async (req, res) => {
  try {
    const product = new wishlistModel(req.body);
    await product.save();

    res.json({ message: "Product added to wishlist", product });
  } catch (error) {
    console.error("Error adding the product:", error);
    res.status(400).json({ message: "This product is already in your wishlist", error });
  }
});


// Get user's category
wishlist.get("/one-category", adminAuth, async (req, res) => {
  try {
    const category = req.user;
    res.send(category);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

// Get all wishlist
wishlist.get("/all-wishlist", async (req, res) => {
  try {
    const product = await wishlistModel.find();
    if (!product) throw new Error("wishlist are not found");
    res.send(product);
  } catch (error) {
    res.status(400).send("bad request");
  }
});

wishlist.post("/delete-wishlist", async (req, res) => {
  try {
    const { customerid, productName } = req.body;

    if (!customerid || !productName) {
      return res.status(400).json({ success: false, message: "customerid and productName are required" });
    }

    const deleted = await wishlistModel.findOneAndDelete({
      customerid: customerid,
      productName: productName,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    res.json({ success: true, message: "Wishlist item deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Count wishlist
wishlist.get("/count-wishlist", async (req, res) => {
  try {
    const product = await wishlistModel.find();
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No wishlist found", count: 0, product: [] });
    }

    res.json({ count: product.length, product });
  } catch (error) {
    console.error("Error fetching category count:", error);
    res.status(400).json({ message: "Bad request" });
  }
});

// Update product with multiple images
wishlist.patch("/update-product", upload.array("images", 5), async (req, res) => {
  try {
    const productId = req.body._id;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    if (!isValidObjectId(productId)) return res.status(400).json({ error: "Invalid ID format" });

    let product = await wishlistModel.findById(productId);
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
wishlist.get("/search-product", adminAuth, async (req, res) => {
  try {
    const findUser = await wishlistModel.findOne(req.body);
    res.send(findUser);
  } catch (error) {
    res.status(500).json({ error: "product not found" });
  }
});


wishlist.post("/wishlist-data", async (req, res) => {
  const { customerid } = req.body;

  try {
    const userCart = await wishlistModel.find({ customerid });
    res.status(200).json({ success: true, response: userCart });
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ success: false, message: "Error fetching cart data" });
  }
});

// Bulk upload wishlist from CSV
wishlist.post("/bulk-upload-product", uploadCSV.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file required" });

    const filePath = req.file.path;
    const wishlist = [];

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

        wishlist.push(product);
      })
      .on("end", async () => {
        try {
          await wishlistModel.insertMany(wishlist, { ordered: false });
          res.json({ message: "Upload successful, wishlist inserted" });
        } catch (insertErr) {
          console.error("Insert error:", insertErr);
          res.status(500).json({ message: "Failed to insert some or all wishlist", error: insertErr });
        }
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        res.status(500).json({ message: "Failed to parse CSV file", error: err });
      });
  } catch (error) {
    console.error("Error inserting wishlist:", error);
    res.status(500).json({ message: "Error processing CSV upload", error });
  }
});

module.exports = wishlist;