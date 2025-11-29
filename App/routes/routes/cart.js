// const express = require("express");
// const cartRoute = express.Router();
// const { isValidObjectId } = require("../../utils/validation");
// const cartModel = require("../../models/cart");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");

// // ✅ Image storage path setup
// const storagePath = path.join(__dirname, "../../storage/cartImages");
// if (!fs.existsSync(storagePath)) {
//     fs.mkdirSync(storagePath, { recursive: true });
//     console.log("Directory created:", storagePath);
// }

// // ✅ Multer setup
// const imageconfig = multer.diskStorage({
//     destination: (req, file, callback) => callback(null, storagePath),
//     filename: (req, file, callback) => callback(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage: imageconfig, limits: { fileSize: 1000000000 } });

// // ✅ Create Cart
// cartRoute.post("/CreateCart", upload.single("images"), async (req, res) => {
//     try {
//         if (req.file) {
//             req.body.images = req.file.filename;
//         }
//         const newCart = new cartModel(req.body);
//         await newCart.save();
//         res.json({ message: "Added Product Successfully" });
//     } catch (error) {
//         console.error("Error adding Product:", error);
//         res.status(400).json({ message: "Error adding the Product", error });
//     }
// });

// // ✅ Update Cart
// cartRoute.patch("/update-Cart", upload.single("images"), async (req, res) => {
//     try {
//         const CartId = req.body._id;
//         if (!isValidObjectId(CartId)) {
//             return res.status(400).json({ error: "Invalid ID format" });
//         }

//         let Cart = await cartModel.findById(CartId);
//         if (!Cart) return res.status(404).json({ error: "Cart not found" });

//         // Delete old image if new one uploaded
//         if (req.file) {
//             const oldImagePath = path.join(storagePath, Cart.images || "");
//             if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
//             Cart.images = req.file.filename;
//         }

//         // Update all other fields
//         Object.keys(req.body).forEach(key => {
//             if (key !== "_id") Cart[key] = req.body[key];
//         });

//         await Cart.save();
//         res.json({ message: "Cart data updated successfully", Cart });
//     } catch (error) {
//         console.error("Error updating Cart:", error);
//         res.status(500).json({ error: "Something went wrong" });
//     }
// });

// // ✅ Delete Cart
// cartRoute.delete("/delete-Cart", async (req, res) => {
//     try {
//         const CartId = req.body._id;
//         if (!isValidObjectId(CartId)) {
//             return res.status(400).json({ error: "Invalid ID format" });
//         }

//         const deleted = await cartModel.findByIdAndDelete(CartId);
//         if (!deleted) return res.status(404).json({ error: "Cart not found" });

//         res.send("Cart deleted successfully");
//     } catch (error) {
//         res.status(400).send("Error deleting the Cart");
//     }
// });

// // ✅ Search Cart (use query or params instead of body)
// cartRoute.get("/search-Cart", async (req, res) => {
//     try {
//         const searchParams = req.query; // example: /search-Cart?user_id=123
//         const cart = await cartModel.findOne(searchParams);
//         if (!cart) return res.status(404).send("Cart not found");
//         res.send(cart);
//     } catch (error) {
//         res.status(400).send("Error searching for cart");
//     }
// });

// // ✅ Get All Cart Data
// cartRoute.get("/Cart-data", async (req, res) => {
//     try {
//         const allCarts = await cartModel.find();
//         res.send(allCarts);
//     } catch (error) {
//         res.status(400).send("Error fetching cart data");
//     }
// });

// module.exports = cartRoute;

const express = require("express");
const cartRoute = express.Router();
const { isValidObjectId } = require("../../utils/validation");
const cartModel = require("../../models/cart");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// ✅ Image storage path setup
const storagePath = path.join(__dirname, "../../storage/cartImages");
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
    console.log("Directory created:", storagePath);
}

// ✅ Multer setup
const imageconfig = multer.diskStorage({
    destination: (req, file, callback) => callback(null, storagePath),
    filename: (req, file, callback) => callback(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: imageconfig, limits: { fileSize: 1000000000 } });

// ✅ Create Cart

// cartRoute.post('/create-cart', async (req, res) => {
//   try {
//     const {
//       productName,
//       description,
//       discountedPrice,
//       category,
//       brand,
//       unit,
//       size,
//       discount,
//       material,
//       color,
//       age,
//       stock,
//       quantity,
//       reviews,
//       images,
//       customerId,
//       customerName,
//       productId,
//       mainPrice,
//       gst,
//       cess,
//       videoUrl,
//     } = req.body;

//     // ✅ Remove unnecessary required fields (keep minimal)
//     const requiredFields = [
//       "productName",
//       "discountedPrice",
//       "category",
//       "quantity",
//       "images",
//       "customerId",
//       "productId"
//     ];

//     const missing = requiredFields.filter(field => !req.body[field]);
//     if (missing.length > 0) {
//       return res.status(400).json({
//         error: `Missing required fields: ${missing.join(", ")}`,
//       });
//     }

//     // ✅ Fix price handling
//     const unitPrice = parseFloat(mainPrice) || parseFloat(discountedPrice) || 0;

//     // ✅ Check if cart item already exists (without status)
//     const existingItem = await cartModel.findOne({
//       productId,
//       size,
//       customerId,
//     });

//     if (existingItem) {
//       existingItem.quantity = Number(existingItem.quantity) + Number(quantity);
//       existingItem.discountedPrice = unitPrice * existingItem.quantity;
//       await existingItem.save();

//       return res.status(200).json({
//         message: "Cart updated successfully",
//         cart: existingItem,
//       });
//     }

//     // ✅ Create new cart item
//     const newCartItem = await cartModel.create({
//       productName,
//       description,
//       discountedPrice: discountedPrice || unitPrice * Number(quantity),
//       category,
//       brand,
//       unit,
//       size,
//       discount: discount ? parseFloat(discount) : 0,
//       material,
//       color,
//       age,
//       stock,
//       quantity: Number(quantity),
//       reviews: reviews ? Number(reviews) : 0,
//       images: Array.isArray(images) ? images : [images],
//       customerId,
//       customerName,
//       productId,
//       mainPrice,
//       gst: gst || 0,
//       cess: cess || 0,
//       videoUrl: videoUrl || "",
//     });

//     return res.status(201).json({
//       message: "Cart item created successfully",
//       cart: newCartItem,
//     });
//   } catch (error) {
//     console.error("❌ Error creating cart:", error);
//     return res.status(500).json({ error: "Failed to create cart item" });
//   }
// });

cartRoute.post("/create-cart", async (req, res) => {
  try {
    console.log("📥 Incoming Cart Request:", req.body);

    let {
      productName,
      description,
      discountedPrice,
      category,
      brand,
      unit,
      size,
      discount,
      material,
      color,
      age,
      stock,
      quantity,
      reviews,
      images,
      customerId,
      customerName,
      productId,
      mainPrice,
      gst,
      cess,
      videoUrl,
    } = req.body;

    // ensure required fields
    if (!productName || !discountedPrice || !category || !quantity || !customerId || !productId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // fallback for images
    if (!images || !Array.isArray(images) || images.length === 0) {
      images = ["https://via.placeholder.com/150"];
    }

    // ✅ Make sure both are numbers
    const originalPrice = parseFloat(mainPrice) || 0;
    const finalDiscountedPrice = parseFloat(discountedPrice) || originalPrice;

    // check if item already exists
    const existingItem = await cartModel.findOne({ customerId, productId });

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity) + Number(quantity);

      // ✅ Keep both original & discounted price updated
      existingItem.mainPrice = originalPrice;
      existingItem.discountedPrice = finalDiscountedPrice;

      await existingItem.save();

      return res.status(200).json({
        message: "Cart updated successfully",
        cart: existingItem,
      });
    }

    // ✅ create new cart entry
    const newCartItem = await cartModel.create({
      productName,
      description,
      mainPrice: originalPrice,
      discountedPrice: finalDiscountedPrice,
      category,
      brand,
      unit,
      size,
      discount: discount ? parseFloat(discount) : 0,
      material,
      color,
      age,
      stock: Number(stock) || 0,
      quantity: Number(quantity),
      reviews: reviews ? Number(reviews) : 0,
      images,
      customerId,
      customerName,
      productId,
      gst: gst || "0",
      cess: cess || "0",
      videoUrl: videoUrl || "",
    });

    return res.status(201).json({
      message: "Cart item created successfully",
      cart: newCartItem,
    });
  } catch (error) {
    console.error("❌ Error creating cart:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Cart item already exists" });
    }
    return res.status(500).json({ error: "Failed to create cart item" });
  }
});




// ✅ Update Cart
cartRoute.patch("/update-Cart", upload.single("images"), async (req, res) => {
    try {
        const CartId = req.body._id;
        if (!isValidObjectId(CartId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        let Cart = await cartModel.findById(CartId);
        if (!Cart) return res.status(404).json({ error: "Cart not found" });

        // Delete old image if new one uploaded
        if (req.file) {
            const oldImagePath = path.join(storagePath, Cart.images || "");
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            Cart.images = req.file.filename;
        }

        // Update all other fields
        Object.keys(req.body).forEach(key => {
            if (key !== "_id") Cart[key] = req.body[key];
        });

        await Cart.save();
        res.json({ message: "Cart data updated successfully", Cart });
    } catch (error) {
        console.error("Error updating Cart:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// ✅ Delete Cart
cartRoute.delete("/delete-allCart", async (req, res) => {
    try {
        const customerId = req.body.customerId;
        if (!customerId) {
            return res.status(400).json({ error: "customerid is required" });
        }

        const deleted = await cartModel.deleteMany({ customerId });

        res.json({ message: "All cart items deleted", deletedCount: deleted.deletedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting cart items" });
    }
});

cartRoute.delete("/delete-Cart", async (req, res) => {
    try {
        const { _id, customerId } = req.body;

        // Validate _id
        if (!_id || !isValidObjectId(_id)) {
            return res.status(400).json({ error: "Invalid cart ID format" });
        }

        // Validate customerid
        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        const deletedCart = await cartModel.findOneAndDelete({
            _id,
            customerId,
        });

        if (!deletedCart) {
            return res.status(404).json({ error: "Cart item not found" });
        }

        res.status(200).json({ message: "Cart deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting cart:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ✅ Search Cart (use query or params instead of body)
cartRoute.get("/search-Cart", async (req, res) => {
    try {
        const searchParams = req.query; // example: /search-Cart?user_id=123
        const cart = await cartModel.findOne(searchParams);
        if (!cart) return res.status(404).send("Cart not found");
        res.send(cart);
    } catch (error) {
        res.status(400).send("Error searching for cart");
    }
});

// ✅ Get All Cart Data
cartRoute.get("/Cart-all-data", async (req, res) => {
    try {
        const allCarts = await cartModel.find();
        res.send(allCarts);
    } catch (error) {
        res.status(400).send("Error fetching cart data");
    }
});

cartRoute.post("/Cart-data", async (req, res) => {
    const { customerid } = req.body;

    try {
        const userCart = await cartModel.find({ customerid });
        res.status(200).json({ success: true, response: userCart });
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ success: false, message: "Error fetching cart data" });
    }
});



module.exports = cartRoute;