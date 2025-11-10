const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
    },
    bannerTitle: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
    // The products field is an array of objects
    products: [
      {
        // product id field
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to your Product model
        },
        // product name field
        productName: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const BannerModel = mongoose.model("banners", BannerSchema);
module.exports = BannerModel;