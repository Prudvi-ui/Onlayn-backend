// const express = require("express");
// const cartRoute = express.Router();
// const cartModel = require("../../models/cart"); // NEW MODEL IMPORT
// const productModel = require("../../models/products");
// const { isValidObjectId } = require("../../utils/validation");
// const { userAuth } = require("../../middlewares/userAuth");

// // cartRoute.post("/create-cart", userAuth, async (req, res) => {
// //   try {
// //     const { productId, quantity = 1 } = req.body;
// //     const customerId = req.customer._id;

// //     const product = await productModel.findById(productId);
// //     if (!product) {
// //       return res.status(404).json({ error: "Product not found" });
// //     }

// //     let existingItem = await cartModel.findOne({ customerId, productId: product._id });
// //     if (existingItem) {
// //       existingItem.quantity += quantity;
// //       await existingItem.save();
// //       return res.json({ message: "Cart updated", cart: existingItem });
// //     }

// //     const newCartItem = new cartModel({
// //       customerId,
// //       productId: product._id, // ✅ always store real ObjectId
// //       productName: product.productName,
// //       price: product.price,
// //       category: product.category,
// //       brand: product.brand,
// //       variants: product.variants,
// //       quantity,
// //       reviews: product.reviews,
// //       images: product.images,
// //     });

// //     await newCartItem.save();
// //     res.status(201).json({ message: "Item added to cart", cart: newCartItem });
// //   } catch (error) {
// //     console.error("Error adding to cart:", error);
// //     res.status(500).json({ error: "Failed to add to cart" });
// //   }
// // });

// // ✅ Get User's Cart


// cartRoute.post("/create-cart", userAuth, async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const customerId = req.customer._id;

//     if (!customerId) return res.status(401).json({ error: "Unauthorized" });

//     // Find the product
//     const product = await productModel.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     // Calculate discounted price
//     const discount = product.discount || 0;
//     const originalPrice = Number(product.price) || 0;
//     const discountedPrice = originalPrice - (originalPrice * discount) / 100;

//     // Check if item already exists
//     let existingItem = await cartModel.findOne({ customerId, productId });
//     if (existingItem) {
//       existingItem.quantity += quantity;
//       await existingItem.save();
//       return res.json({ message: "Cart updated", cart: existingItem });
//     }

//     // Pick first variant if exists
//     const variant =
//       Array.isArray(product.variants) && product.variants.length > 0
//         ? product.variants[0]
//         : product.variants || {};

//     // Create new cart item
//     const newCartItem = new cartModel({
//       customerId,
//       productId,
//       productName: product.productName,
//       price: discountedPrice,          // ✅ use discounted price
//       originalPrice: originalPrice,    // ✅ keep original for reference (optional)
//       discount: discount,
//       category: product.category || "N/A",
//       brand: product.brand || "N/A",
//       unit: product.unit || "One Size",
//       size: product.size || "One Size",
//       stock: product.stock || 0,
//       material: product.material || "N/A",
//       color: product.color || "N/A",
//       age: product.age || "0+",
//       quantity,
//       reviews: product.reviews || 0,
//       images: product.images.length
//         ? product.images
//         : ["https://via.placeholder.com/150"],
//     });

//     await newCartItem.save();
//     res.status(201).json({ message: "Item added to cart", cart: newCartItem });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ error: error.message || "Failed to add to cart" });
//   }
// });



// // cartRoute.get("/get-cart", userAuth, async (req, res) => {
// //       try {
// //         console.log("---- /get-cart API Hit ----");
    
// //         if (!req.customer) {
// //           console.log("Unauthorized: req.customer is missing");
// //           return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
// //         }
    
// //         console.log("Authenticated User ID:", req.customer._id);
    
// //         const cart = await cartModel.findOne({ userId: req.customer._id }).populate({
// //           path: 'items.productId',
// //           select: 'productName price images'
// //         });
    
// //         if (!cart) {
// //           console.log("No cart found for user:", req.customer._id);
// //           return res.status(200).json({ items: [] });
// //         }
    
// //         console.log("Cart Found:", cart);
// //         res.json({ message: "Cart fetched successfully", items: cart.items });
    
// //       } catch (error) {
// //         console.error("Error in /get-cart:", error);
// //         res.status(500).json({ error: "Error fetching cart data", details: error.message });
// //       }
// //     });


// cartRoute.get("/cart-data", userAuth, async (req, res) => {
//   try {
//     const customerId = req.customer._id;

//     const cartItems = await cartModel
//       .find({ customerId })
//       .populate("productId", "productName price images");

//     res.json({ message: "Cart fetched successfully", items: cartItems });
//   } catch (error) {
//     console.error("Error fetching cart:", error);
//     res.status(500).json({ error: "Error fetching cart data" });
//   }
// });



// // cartRoute.put("/update-cart-item", userAuth, async (req, res) => {
// //       try {
// //           if (!req.customer) {
// //               return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
// //           }
  
// //           const { itemId, quantity } = req.body;
// //           const userId = req.customer._id;
  
// //           if (!isValidObjectId(itemId) || typeof quantity !== 'number' || quantity < 1) {
// //               return res.status(400).json({ error: "Invalid item ID or quantity" });
// //           }
  
// //           const cart = await cartModel.findOne({ userId });
// //           if (!cart) {
// //               return res.status(404).json({ error: "Cart not found" });
// //           }
  
// //           const item = cart.items.id(itemId);
// //           if (!item) {
// //               return res.status(404).json({ error: "Cart item not found" });
// //           }
  
// //           item.quantity = quantity;
// //           await cart.save();
  
// //           // FIX: Populate productId in response
// //           await cart.populate("items.productId");
  
// //           res.json({ message: "Cart item quantity updated", cart });
// //       } catch (error) {
// //           console.error("Error updating Cart item:", error);
// //           res.status(500).json({ error: "Something went wrong" });
// //       }
// //   });


// cartRoute.put("/update-cart-item", userAuth, async (req, res) => {
//   try {
//     const { cartItemId, quantity } = req.body;
//     const customerId = req.customer._id;

//     if (!isValidObjectId(cartItemId) || typeof quantity !== "number" || quantity < 1) {
//       return res.status(400).json({ error: "Invalid cart item ID or quantity" });
//     }

//     const cartItem = await cartModel.findOne({ _id: cartItemId, customerId });
//     if (!cartItem) {
//       return res.status(404).json({ error: "Cart item not found" });
//     }

//     cartItem.quantity = quantity;
//     await cartItem.save();

//     res.json({ message: "Cart item quantity updated", cart: cartItem });
//   } catch (error) {
//     console.error("Error updating cart item:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });


// cartRoute.delete("/delete-cart-item/:itemId", userAuth, async (req, res) => {
//       try {
//         if (!req.customer) {
//           return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
//         }
    
//         const { itemId } = req.params;
//         const userId = req.customer._id;
    
//         if (!isValidObjectId(itemId)) {
//           return res.status(400).json({ error: "Invalid item ID format" });
//         }
    
//         const cart = await cartModel.findOne({ userId });
//         if (!cart) {
//           return res.status(404).json({ error: "Cart not found" });
//         }
    
//         // Filter out the item
//         cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
//         await cart.save();
    
//         // 🟢 FIX: Populate productId after deletion
//         const populatedCart = await cart.populate("items.productId");
    
//         res.json({ message: "Cart item deleted successfully", cart: populatedCart });
//       } catch (error) {
//         console.error("Error deleting cart item:", error);
//         res.status(500).json({ error: "Error deleting the cart item" });
//       }
//     });

// cartRoute.get("/all-carts", async (req, res) => {
//     try {
//         const allCarts = await cartModel.find().populate({
//             path: 'items.productId',
//             select: 'productName price'
//         });
//         res.json(allCarts);
//     } catch (error) {
//         console.error("Error fetching all carts:", error);
//         res.status(500).json({ error: "Error fetching cart data" });
//     }
// });


// cartRoute.delete("/clear-cart", userAuth, async (req, res) => {
//       try {
//           if (!req.customer) {
//               return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
//           }
  
//           const userId = req.customer._id;
  
//           const cart = await cartModel.findOne({ userId });
//           if (!cart) {
//               return res.status(404).json({ error: "Cart not found" });
//           }
  
//           // Clear the items array
//           cart.items = [];
  
//           await cart.save();
  
//           res.json({ message: "Cart cleared successfully", cart });
//       } catch (error) {
//           console.error("Error clearing cart:", error);
//           res.status(500).json({ error: "Error clearing the cart" });
//       }
//   });

// module.exports = cartRoute;

const express = require("express");
const cartRoute = express.Router();
const cartModel = require("../../models/cart");
const productModel = require("../../models/products");
const { isValidObjectId } = require("../../utils/validation");
const { userAuth } = require("../../middlewares/userAuth");

/**
 * Add item to cart
 */
// cartRoute.post("/create-cart", userAuth, async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const customerId = req.customer._id;

//     // Get product details
//     const product = await productModel.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // Check if already in cart
//     let existingItem = await cartModel.findOne({ customerId, productId });
//     if (existingItem) {
//       existingItem.quantity += quantity;
//       await existingItem.save();
//       return res.json({ message: "Cart updated", cart: existingItem });
//     }

//     // Create new cart document
//     const newCartItem = new cartModel({
//       customerId,
//       productId,
//       productName: product.productName,
//       price: product.price,
//       category: product.category,
//       brand: product.brand,
//       variants: product.variants,
//       quantity,
//       reviews: product.reviews,
//       images: product.images,
//     });

//     await newCartItem.save();
//     res.status(201).json({ message: "Item added to cart", cart: newCartItem });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ error: "Failed to add to cart" });
//   }
// });

// cartRoute.post("/create-cart", userAuth, async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const customerId = req.customer._id;

//     const product = await productModel.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     let existingItem = await cartModel.findOne({ customerId, productId: product._id });
//     if (existingItem) {
//       existingItem.quantity += quantity;
//       await existingItem.save();
//       return res.json({ message: "Cart updated", cart: existingItem });
//     }

//     const newCartItem = new cartModel({
//       customerId,
//       productId: product._id, // ✅ always store real ObjectId
//       productName: product.productName,
//       price: product.price,
//       category: product.category,
//       brand: product.brand,
//       variants: product.variants,
//       quantity,
//       reviews: product.reviews,
//       images: product.images,
//     });

//     await newCartItem.save();
//     res.status(201).json({ message: "Item added to cart", cart: newCartItem });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ error: "Failed to add to cart" });
//   }
// });
// cartRoute.post("/create-cart", userAuth, async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const customerId = req.customer._id;

//     if (!customerId) return res.status(401).json({ error: "Unauthorized" });

//     // Find the product
//     const product = await productModel.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     // Check if item already exists
//     let existingItem = await cartModel.findOne({ customerId, productId });
//     if (existingItem) {
//       existingItem.quantity += quantity;
//       await existingItem.save();
//       return res.json({ message: "Cart updated", cart: existingItem });
//     }

//     // Pick first variant if exists
//     const variant = Array.isArray(product.variants) && product.variants.length > 0
//       ? product.variants[0]
//       : product.variants || {};

//     // Create new cart item
//     const newCartItem = new cartModel({
//       customerId,
//       productId,
//       productName: product.productName,
//       price: product.price,
//       category: product.category || "N/A",
//       brand: product.brand || "N/A",
//       unit: product.unit || "One Size",
//       size: product.size || "One Size",
//       discount: product.discount || 0,
//       stock: product.stock || 0,
//       material: product.material || "N/A",
//       color: product.color || "N/A",
//       age: product.age || "0+",
//       quantity,
//       reviews: product.reviews || 0,
//       images: product.images.length ? product.images : ["https://via.placeholder.com/150"],
//     });

//     await newCartItem.save();
//     res.status(201).json({ message: "Item added to cart", cart: newCartItem });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ error: error.message || "Failed to add to cart" });
//   }
// });

cartRoute.post("/create-cart", userAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const customerId = req.customer._id;

    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    // Find the product
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Calculate discounted price
    const discount = product.discount || 0;
    const originalPrice = Number(product.price) || 0;
    const discountedPrice = originalPrice - (originalPrice * discount) / 100;

    // Check if item already exists
    let existingItem = await cartModel.findOne({ customerId, productId });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json({ message: "Cart updated", cart: existingItem });
    }

    // Pick first variant if exists
    const variant =
      Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants[0]
        : product.variants || {};

    // Create new cart item
    const newCartItem = new cartModel({
      customerId,
      productId,
      productName: product.productName,
      price: discountedPrice,          // ✅ use discounted price
      originalPrice: originalPrice,    // ✅ keep original for reference (optional)
      discount: discount,
      category: product.category || "N/A",
      brand: product.brand || "N/A",
      unit: product.unit || "One Size",
      size: product.size || "One Size",
      stock: product.stock || 0,
      material: product.material || "N/A",
      color: product.color || "N/A",
      age: product.age || "0+",
      quantity,
      reviews: product.reviews || 0,
      images: product.images.length
        ? product.images
        : ["https://via.placeholder.com/150"],
    });

    await newCartItem.save();
    res.status(201).json({ message: "Item added to cart", cart: newCartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: error.message || "Failed to add to cart" });
  }
});


/**
 * Get user's cart
 */
cartRoute.get("/cart-data", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id;

    const cartItems = await cartModel
      .find({ customerId })
      .populate("productId", "productName price images");

    res.json({ message: "Cart fetched successfully", items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Error fetching cart data" });
  }
});

/**
 * Update quantity
 */
cartRoute.put("/update-cart-item", userAuth, async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const customerId = req.customer._id;

    if (!isValidObjectId(cartItemId) || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ error: "Invalid cart item ID or quantity" });
    }

    const cartItem = await cartModel.findOne({ _id: cartItemId, customerId });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: "Cart item quantity updated", cart: cartItem });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * Delete item from cart
 */
cartRoute.delete("/delete-cart-item/:cartItemId", userAuth, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const customerId = req.customer._id;

    if (!isValidObjectId(cartItemId)) {
      return res.status(400).json({ error: "Invalid cart item ID" });
    }

    const deleted = await cartModel.findOneAndDelete({ _id: cartItemId, customerId });
    if (!deleted) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Error deleting the cart item" });
  }
});

/**
 * Clear entire cart
 */
cartRoute.delete("/clear-cart", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id;
    await cartModel.deleteMany({ customerId });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Error clearing the cart" });
  }
});

/**
 * Admin: Get all carts
 */
cartRoute.get("/all-carts", async (req, res) => {
  try {
    const allCarts = await cartModel
      .find()
      .populate("productId", "productName price");
    res.json(allCarts);
  } catch (error) {
    console.error("Error fetching all carts:", error);
    res.status(500).json({ error: "Error fetching cart data" });
  }
});

module.exports = cartRoute;