const mongoose = require("mongoose");
const { type } = require("os");

const subcategorySchema = new mongoose.Schema(
  {
    subcategoryImage: {
      type: String,
    },
    subcategoryName: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
    categoryName: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);

const subcategoryModel = mongoose.model("subcategories", subcategorySchema);
module.exports = subcategoryModel;
