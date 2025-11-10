const mongoose = require("mongoose");
const { type } = require("os");

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      minLength: 4,
      maxLength: 50,
    },
  },
  { timestamps: true }
);

const BrandModel = mongoose.model("brands", BrandSchema);
module.exports = BrandModel;
