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
// cartRoute.post("/CreateCart", async (req, res) => {
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

// cartRoute.post('/create-cart', async (req, res) => {
//     try {
//         const {
//             productName,
//             description,
//             price,
//             category,
//             brand,
//             metaTitle,
//             metaKeyword,
//             metaDescription,
//             unit,
//             size,
//             discount,
//             material,
//             color,
//             age,
//             stock,
//             quantity,
//             reviews,
//             images,
//             customerid,
//             customerName,
//             productid, // Ensure this is passed in the request body
//         } = req.body;

//         // ✅ Validate required fields
//         if (!productName || !price || !category || !brand || !unit || !size || !material || !color || !age || !quantity || !images || !customerid || !stock) {
//             return res.status(400).json({ error: 'Required fields are missing' });
//         }

//         // ✅ Check if item already exists in cart for the same customer
//         const existingItem = await cartModel.findOne({
//             productName,
//             size,
//             customerid,
//         });

//         if (existingItem) {
//             // ✅ Replace quantity and price with new values
//             existingItem.quantity = String(quantity); // Replace, don't add
//             existingItem.price = Number(price);       // Replace, don't add

//             await existingItem.save();

//             return res.status(200).json({
//                 message: 'Cart item updated successfully',
//                 cart: existingItem,
//             });
//         }

//         // ✅ Create new cart item
//         const newCartItem = await cartModel.create({
//             productName,
//             description,
//             price: parseFloat(price),
//             category,
//             brand,
//             metaTitle,
//             metaKeyword,
//             metaDescription,
//             unit,
//             size,
//             discount: discount ? parseFloat(discount) : 0,
//             material,
//             color,
//             age,
//             stock,
//             quantity: String(quantity),
//             reviews,
//             images,
//             customerid,
//             customerName,
//             productid,
//         });

//         return res.status(201).json({
//             message: 'Cart item created successfully',
//             cart: newCartItem,
//         });

//     } catch (error) {
//         console.error('❌ Error creating cart:', error);
//         return res.status(500).json({ error: 'Failed to create cart item' });
//     }
// });


cartRoute.post('/create-cart', async (req, res) => {
    try {
        const {
            productName,
            description,
            price,
            category,
            brand,
            metaTitle,
            metaKeyword,
            metaDescription,
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
        } = req.body;

        // ✅ Validate required fields
        if (!productName || !price || !category || !brand || !unit || !size || !material || !color || !age || !quantity || !images || !customerId || !stock) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        // ✅ Check if item already exists in cart for the same customer + product + size
        const existingItem = await cartModel.findOne({
            productId,
            size,
            customerId,
        });

        if (existingItem) {
            // ✅ Increase quantity and total price
            existingItem.quantity = String(Number(existingItem.quantity) + Number(quantity));

            // price should represent total amount (unit price × quantity)
            const unitPrice = Number(price);
            existingItem.price = unitPrice * Number(existingItem.quantity);

            await existingItem.save();

            return res.status(200).json({
                message: 'Cart Created successfully ',
                cart: existingItem,
            });
        }

        // ✅ Create new cart item
        const unitPrice = parseFloat(price);
        const newCartItem = await cartModel.create({
            productName,
            description,
            price: unitPrice * Number(quantity), // store total price
            category,
            brand,
            metaTitle,
            metaKeyword,
            metaDescription,
            unit,
            size,
            discount: discount ? parseFloat(discount) : 0,
            material,
            color,
            age,
            stock,
            quantity: String(quantity),
            reviews,
            images,
            customerId,
            customerName,
            productId,
        });

        return res.status(201).json({
            message: 'Cart item created successfully',
            cart: newCartItem,
        });

    } catch (error) {
        console.error('❌ Error creating cart:', error);
        return res.status(500).json({ error: 'Failed to create cart item' });
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