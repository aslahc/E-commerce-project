const { Admin } = require("mongodb");
const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
// Load Dashboard
const loadDash = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find({});

    // Fetch all orders with populated product details
    const orders = await Order.find({});

    // Calculate total revenue
    const revenue = orders.reduce((totalRevenue, order) => {
      if (order.status !== 'Cancelled') {
        const orderRevenue = order.products.reduce(
          (subtotal, product) => subtotal + product.price * product.quantity,
          0
        );
        totalRevenue += orderRevenue;
      }
      return totalRevenue;
    }, 0);

    // Calculate total number of orders (excluding cancelled orders)
    const totalNumberOfOrders = orders.reduce((totalOrders, order) => {
      if (order.status !== 'Cancelled') {
        return totalOrders + order.products.length;
      }
      return totalOrders;
    }, 0);

    // Fetch total number of products
    const totalNumberOfProducts = await Products.countDocuments();

    // Fetch total number of categories
    const totalCategories = await Category.countDocuments();

    // Calculate monthly revenue
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const monthlyOrders = await Order.find({
      createdOn: { $gte: firstDayOfMonth },
    });



    // Calculate monthly revenue (excluding cancelled orders)
    const monthlyRevenue = monthlyOrders.reduce((totalRevenue, order) => {
      const completedProducts = order.products.filter(
        (product) => product.status !== 'Cancelled'
      );

      const orderRevenue = completedProducts.reduce(
        (subtotal, product) => subtotal + product.price * product.quantity,
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

    const usersData = await User.find(query).sort({ createdAt: -1 })
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
 
    console.log("enterinfgg")
    const userId = req.params.userId;

    const userData = await User.findById(userId);
    if (!userData) {  
      return res.status(404).json({ error: "User not found" });
    }


      // Toggle is_block status
      userData.is_block = !userData.is_block;
      
      await userData.save();

    console.log("chanefes suces")
      if (userData.is_block) res.json({ success: true, is_blocked: true });
   
      if (!userData.is_block) res.json({ success: true, is_blocked: false });
      // Save the updated user data
     
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
