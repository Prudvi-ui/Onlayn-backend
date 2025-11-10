const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");

const adminAuth = async (req, res, next) => {
  try {
    // ✅ Get token from Authorization header (e.g. "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    let verifyToken;
    try {
      verifyToken = jwt.verify(token, "vamsi@1998");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired. Please login again." });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token. Please login again." });
      } else {
        return res.status(400).json({ error: "Token verification failed." });
      }
    }

    const user = await UserModel.findById(verifyToken._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== "Admin" && user.role !== "Super Admin") {
      return res.status(403).json({ error: "Access denied. Invalid user role." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { adminAuth };


