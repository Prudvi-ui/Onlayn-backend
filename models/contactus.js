const mongoose = require("mongoose");
const shortid = require("shortid");

const contactSchema = new mongoose.Schema(
  {
     firstName: {
    type: String,
    
    trim: true,
    minLength: 4,
    maxLength: 50
  },
  lastName: {
    type: String,
    trim: true,
  },
  Name:
  {
     type: String,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    
    unique:true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // Ensures a 10-digit number
      },
      message: "Invalid mobile number format.",
    },
  },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const contactModel = mongoose.model("contactus", contactSchema);
module.exports = contactModel;
