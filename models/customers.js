const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    
    trim: true,
    minLength: 4,
    maxLength: 50
  },
  profilePicture:
  {
      type: String,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true,
  },
  pinCode: {
    type: String,
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
  address: [
      {
        label: {
          type: String,
          enum: ["Home", "Work", "Other"],
          required: true,
        },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: "India" },
      },
    ],
  password: {
    type: String,
    
  },
},
{ timestamps: true }
);

const UserModel = mongoose.model("customers", UserSchema);
module.exports = UserModel;
