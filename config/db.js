const mongoose = require("mongoose");

const ConnectDB = async () => {
  try {
    // await mongoose.connect("mongodb+srv://asocialculturalsociety:Ababileducation123%40@cluster0.b6pbfk6.mongodb.net/toyshack");
        await mongoose.connect("mongodb+srv://toyshack92_db_user:yZpMEPUTBsSufqB9@cluster0.tewsxvk.mongodb.net/toyshack");

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

 
module.exports = ConnectDB;