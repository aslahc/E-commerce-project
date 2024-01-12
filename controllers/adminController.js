const { Admin } = require("mongodb");
const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
// Load Dashboard
const loadDash = async (req, res) => {
  try {
    const categories = await Category.find({});
    const orders = await Order.find({});

    const revenue = orders.reduce((totalRevenue, order) => {
      const completedProducts = order.products.filter(
        (product) => product.status === "Delivered"
      );

      const orderRevenue = completedProducts.reduce(
        (subtotal, product) => subtotal + product.price,
        0
      );

      return totalRevenue + orderRevenue;
    }, 0);

    const totalNumberOfOrders = orders.reduce((totalOrders, order) => {
      return totalOrders + order.products.length;
    }, 0);

    const totalNumberOfProducts = await Products.countDocuments();
    const totalCategories = await Category.countDocuments();

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const monthlyOrders = await Order.find({
      createdOn: { $gte: firstDayOfMonth },
    });

    const monthlyRevenue = monthlyOrders.reduce((totalRevenue, order) => {
      const completedProducts = order.products.filter(
        (product) => product.status === "Delivered"
      );

      const orderRevenue = completedProducts.reduce(
        (subtotal, product) => subtotal + product.price,
        0
      );

      return totalRevenue + orderRevenue;
    }, 0);

    res.render("dashboard", {
      categories,
      orders,
      revenue,
      totalNumberOfOrders,
      totalNumberOfProducts,
      totalCategories,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error in loadDash:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// Load Users List
const loadUsersList = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 0;
    const usersPerPage = 10;

    let query = { is_admin: 0 };

    // Add search functionality
    if (search) {
      const mobileRegex = /^[0-9]+$/; // Regular expression to match numbers only

      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { mobile: mobileRegex.test(search) ? parseInt(search, 10) : null },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    const totalNumberOfUsers = await User.find(query).countDocuments();
    const totalNumberOfPages = Math.ceil(totalNumberOfUsers / usersPerPage);

    const usersData = await User.find(query)
      .skip(page * usersPerPage)
      .limit(usersPerPage);

    res.render("userList", {
      users: usersData,
      search,
      page,
      totalNumberOfPages,
    });
  } catch (error) {
    console.error("Error in loadUsersList:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Block User
const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userData = await User.findById(userId);

    if (userData) {
      // Toggle is_block status
      userData.is_block = !userData.is_block;

      // Save the updated user data
      const updatedUser = await userData.save();

      // Respond with the updated user data
      res.status(200).json(updatedUser);
    } else {
      console.error("Failed to block user: User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error in blockUser:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Logout
const logOut = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.error("Error in logOut:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadDash,
  loadUsersList,
  blockUser,
  logOut,
};
