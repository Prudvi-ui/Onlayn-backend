// // src/routes/wishlist.js (Corrected and Simplified)

// const express = require("express");
// const wishlistRouter = express.Router();
// const wishlistModel = require("../../models/wishlist");
// const { userAuth } = require("../../middlewares/userAuth"); // Make sure path is correct
// const mongoose = require("mongoose");

// // @route   POST /wishlist/add
// // @desc    Add a product to the user's wishlist
// // @access  Private (requires userAuth)
// wishlistRouter.post("/add", userAuth, async (req, res) => {
//     try {
//         const customerId = req.customerId;
//         const productData = req.body;

//         const newWishlistItem = new wishlistModel({
//             ...productData, // Spreads all data from the frontend
//             customerid: customerId,
//         });
        
//         await newWishlistItem.save();

//         res.status(200).json({ message: "Product added to wishlist.", item: newWishlistItem });
//     } catch (error) {
//         console.error("Error adding to wishlist:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });

// // @route   DELETE /wishlist/remove/:id
// // @desc    Remove a product from the user's wishlist by its database ID
// // @access  Private
// wishlistRouter.delete("/remove/:id", userAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const customerId = req.customerId;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid item ID." });
//     }

//     const deletedItem = await wishlistModel.findOneAndDelete({
//       _id: id,
//       customerid: customerId, // Ensure only the owner can delete
//     });

//     if (!deletedItem) {
//       return res.status(404).json({ message: "Wishlist item not found." });
//     }

//     res.status(200).json({ message: "Product removed from wishlist successfully." });
//   } catch (error) {
//     console.error("Error removing from wishlist:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });


// // @route   DELETE /wishlist/clear
// // @desc    Clear the entire wishlist for the logged-in user
// // @access  Private
// wishlistRouter.delete("/clear", userAuth, async (req, res) => {
//   try {
//     const customerId = req.customerId;
//     await wishlistModel.deleteMany({ customerid: customerId });
//     res.status(200).json({ message: "Wishlist cleared successfully." });
//   } catch (error) {
//     console.error("Error clearing wishlist:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });


// // @route   GET /wishlist
// // @desc    Get all products in the user's wishlist
// // @access  Private
// wishlistRouter.get("/", userAuth, async (req, res) => {
//     try {
//         const customerId = req.customerId;
//         // This will fetch all documents with all fields from your database
//         const userWishlist = await wishlistModel.find({ customerid: customerId });
        
//         res.status(200).json({ wishlist: userWishlist });
//     } catch (error) {
//         console.error("Error fetching wishlist:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });
// module.exports = wishlistRouter;

// src/routes/wishlist.js (Corrected and Simplified)

const express = require("express");
const wishlistRouter = express.Router();
const wishlistModel = require("../../models/wishlist");
const { userAuth } = require("../../middlewares/userAuth"); // Make sure path is correct
const mongoose = require("mongoose");

// @route   POST /wishlist/add
// @desc    Add a product to the user's wishlist
// @access  Private (requires userAuth)
// wishlistRouter.post("/add", userAuth, async (req, res) => {
//     try {
//         const customerId = req.customerId;
//         const productData = req.body;

//         const newWishlistItem = new wishlistModel({
//             ...productData, // Spreads all data from the frontend
//             customerid: customerId,
//         });
        
//         await newWishlistItem.save();

//         res.status(200).json({ message: "Product added to wishlist.", item: newWishlistItem });
//     } catch (error) {
//         console.error("Error adding to wishlist:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });

wishlistRouter.post("/add", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id; // always ObjectId
    const { productId, ...rest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Check for existing wishlist entry
    const existing = await wishlistModel.findOne({
      customerid: customerId,
      productId: productId
    });

    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const wishlistItem = new wishlistModel({
      customerid: customerId,
      productId: productId,
      ...rest
    });

    await wishlistItem.save();
    res.status(201).json({ message: "Added to wishlist", item: wishlistItem });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// @route   DELETE /wishlist/remove/:id
// @desc    Remove a product from the user's wishlist by its database ID
// @access  Private
// wishlistRouter.delete("/remove/:id", userAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const customerId = req.customerId;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid item ID." });
//     }

//     const deletedItem = await wishlistModel.findOneAndDelete({
//       _id: id,
//       customerid: customerId, // Ensure only the owner can delete
//     });

//     if (!deletedItem) {
//       return res.status(404).json({ message: "Wishlist item not found." });
//     }

//     res.status(200).json({ message: "Product removed from wishlist successfully." });
//   } catch (error) {
//     console.error("Error removing from wishlist:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

wishlistRouter.delete("/remove/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer._id; // keep consistent

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid wishlist item ID" });
    }

    const deletedItem = await wishlistModel.findOneAndDelete({
      _id: id,
      customerid: customerId
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// @route   DELETE /wishlist/clear
// @desc    Clear the entire wishlist for the logged-in user
// @access  Private
// wishlistRouter.delete("/clear", userAuth, async (req, res) => {
//   try {
//     const customerId = req.customerId;
//     await wishlistModel.deleteMany({ customerid: customerId });
//     res.status(200).json({ message: "Wishlist cleared successfully." });
//   } catch (error) {
//     console.error("Error clearing wishlist:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

wishlistRouter.delete("/clear", userAuth, async (req, res) => {
  try {
    // Use the same ID reference as in your "add" or "get" routes
    const customerId = req.customer._id; 

    await wishlistModel.deleteMany({ customerid: customerId });

    res.status(200).json({ message: "Wishlist cleared successfully." });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// @route   GET /wishlist
// @desc    Get all products in the user's wishlist
// @access  Private
// wishlistRouter.get("/", userAuth, async (req, res) => {
//     try {
//         const customerId = req.customer._id;;
//         // This will fetch all documents with all fields from your database
//         const userWishlist = await wishlistModel.find({ customerid: customerId });
        
//         res.status(200).json({ wishlist: userWishlist });
//     } catch (error) {
//         console.error("Error fetching wishlist:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });

wishlistRouter.get("/", userAuth, async (req, res) => {
  try {
    const customerId = req.customer._id;

    const wishlistItems = await wishlistModel
      .find({ customerid: customerId })
      .populate("productId");

    // Remove any wishlist items where the product no longer exists
    const filteredItems = wishlistItems.filter(item => item.productId !== null);

    res.status(200).json({ wishlist: filteredItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



module.exports = wishlistRouter;