const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
  userTitle: {
    type: String,
    enum: ["Mr", "Mrs", "Miss"], // Only allow specific titles
  },
  address:{
     type: String,
  },
  role: {
    type: String,
    enum: ["Super Admin", "Admin" ,"Supervisor","Delivery Agent"], // Only allow Super Admin and Admin
  },
  status: {
    type: String,
    enum: ["Active", "Inactive","Pending","Approved" ,"Rejected"], // Only allow Active and Inactive
  },
  password: {
    type: String,
    
  },
},
{ timestamps: true }
);

const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel;
