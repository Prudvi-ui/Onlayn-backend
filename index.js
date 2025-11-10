const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ConnectDB = require("./config/db");
require("./models/products");
// ✅ CORS should be at the top
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// ✅ Serve static files
app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use('/storage/productimages', express.static(path.join(__dirname, 'storage', 'productimages')));
// ✅ Dashboard routes
app.use("/Dashboard/Users", require("./Dashboard/routes/Users"));
app.use("/Dashboard/brands", require("./Dashboard/routes/brands"));
app.use("/Dashboard/banners", require("./Dashboard/routes/banners"));
app.use("/Dashboard/categories", require("./Dashboard/routes/categories"));
app.use("/Dashboard/subcategory", require("./Dashboard/routes/subcategory"));
app.use("/Dashboard/products", require("./Dashboard/routes/products"));
app.use("/Dashboard/tasks", require("./Dashboard/routes/tasks"));
app.use("/Dashboard/notifications", require("./Dashboard/routes/notifications"));
app.use("/Dashboard/coupons", require("./Dashboard/routes/coupons"));
app.use("/Dashboard/customers", require("./Dashboard/routes/customers"));
app.use("/Dashboard/cart", require("./Dashboard/routes/cart"));
app.use("/Dashboard/orders", require("./Dashboard/routes/orders"));
app.use("/Dashboard/delivery", require("./Dashboard/routes/delivery"));
app.use("/Dashboard/deliverypincode", require("./Dashboard/routes/deliverypincode"));
app.use("/Dashboard/contactus", require("./Dashboard/routes/contactus"));
app.use("/Dashboard/wishlist", require("./Dashboard/routes/wishlist"));
app.use("/Dashboard/payments", require("./Dashboard/routes/payments"));


app.use("/App/customers", require("./App/routes/customers"));
app.use("/App/brands", require("./App/routes/brands"));
app.use("/App/banners", require("./App/routes/banners"));
app.use("/App/categories", require("./App/routes/categories"));
app.use("/App/subcategory", require("./App/routes/subcategory"));
app.use("/App/products", require("./App/routes/products"));
app.use("/App/notifications", require("./App/routes/notifications"));
app.use("/App/coupons", require("./App/routes/coupons"));
app.use("/App/delivery", require("./App/routes/delivery"));
app.use("/App/deliverypincode", require("./App/routes/deliverypincode"));
app.use("/App/Cart", require("./App/routes/Cart"));
app.use("/App/orders", require("./App/routes/orders"));
app.use("/App/wishlist", require("./App/routes/wishlist"));
app.use("/App/contactus", require("./App/routes/contactus"));
app.use("/App/Comingsoon", require("./App/routes/Comingsoon"));



// ✅ Start server after DB connection
const server = http.createServer(app);

ConnectDB()
  .then(() => {
    console.log("✅ Database connection established...!");
    server.listen(3001, () => {
      console.log("🚀 Server is running on port 3001");
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Optional: exit if DB connection fails
  });