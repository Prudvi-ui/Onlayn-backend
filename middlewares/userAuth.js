// const jwt = require("jsonwebtoken");
// const CustomersModel = require("../models/customers");

// const userAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Unauthorized. No token provided." });
//     }

//     const token = authHeader.split(" ")[1];

//     let verifyToken;
//     try {
//       verifyToken = jwt.verify(token, "vamsi@1998");
//     } catch (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ error: "Token expired. Please login again." });
//       } else if (err.name === "JsonWebTokenError") {
//         return res.status(401).json({ error: "Invalid token. Please login again." });
//       } else {
//         return res.status(400).json({ error: "Token verification failed." });
//       }
//     }

//     const customer = await CustomersModel.findById(verifyToken._id);
//     if (!customer) {
//       return res.status(404).json({ error: "customer not found." });
//     }

//     req.customer = customer;
//     req.customerId = verifyToken._id;  // <---- ADD THIS LINE
//     next();

//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// module.exports = { userAuth };

const jwt = require("jsonwebtoken");
const CustomersModel = require("../models/customers");

const userAuth = async (req, res, next) => {
  try {
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

    const customer = await CustomersModel.findById(verifyToken._id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    req.customerId = customer._id;  // ✅ Attach customerId for downstream routes
    req.customer = customer;        // (Optional) attach full customer if needed

    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { userAuth };