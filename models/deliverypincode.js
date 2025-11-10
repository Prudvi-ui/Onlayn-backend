const mongoose = require("mongoose");

const DeliveryPincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    
  },
  deliveryPrice: {
    type: String,

  },
  minOrder:
  {
    type: String,
  },
   status:
  {
    type: String,
  },
  

}, { timestamps: true });

const deliverypincodeModel = mongoose.model("deliverypincode", DeliveryPincodeSchema);
module.exports = deliverypincodeModel;
