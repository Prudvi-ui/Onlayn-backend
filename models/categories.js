const mongoose = require("mongoose");
const shortid = require("shortid");

const categorySchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      required: true,
      default: () => 'cat' + shortid.generate(),
    },
    categoryImage: {
      type: String,
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

const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel;
