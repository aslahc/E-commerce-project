// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const easyinvoice = require("easyinvoice");
const { Readable } = require("stream");

// Create an Express application
const app = express(); 
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);

// Middleware setup
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching
const nocache = require("nocache");
app.use(nocache());

// Static file setup
app.use(express.static("public"));
app.use(
  "/admin-asset/productImage",
  express.static(path.join(__dirname, "public/admin-assets/productImages"))
);
app.use(
  "/assets/imgs",
  express.static(path.join(__dirname, "/public/admin-assets/imgs"))
);

// Set view engine
app.set("view engine", "ejs");

// Import and use userRoute
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// Import and use adminRoute

const adminRoute = require("./routes/adminRoutes");
app.use("/admin", adminRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:5000`);
});
