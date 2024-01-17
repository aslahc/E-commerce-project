const express = require("express");
const user_route = express();
const session = require("express-session");

const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const addressController = require("../controllers/addressController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const wishlistController = require("../controllers/wishlistController");
const couponController = require("../controllers/couponController");


// error handler 

const errorHandler = require("../middleware/errorHandeler");


// Set views directory
user_route.set("views", "./views/users");

// Session setup
user_route.use(
  session({
    secret: "config.sessionSecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Authentication middleware
const auth = require("../middleware/auth");

// Define routes
user_route.get("/", userController.loadHome);
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", auth.isLogout, userController.verifyLogin);
user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser); // Removed redundant auth.isLogout
user_route.get("/verifyOtp", auth.isLogout, userController.verifyPageLoad);
user_route.post("/verifyOtp", auth.isLogout, userController.confirmOtp);
user_route.get("/home", auth.isLogin, auth.checkBlockedStatus,userController.loadHome);
user_route.get("/logout", auth.isLogin, userController.userLogout);
user_route.get("/resendOtp", userController.resendOtp);

// Additional routes
user_route.get("/productDetails",auth.checkBlockedStatus, productController.productDetailsPage);
user_route.post("/productDetails/:id",auth.checkBlockedStatus, cartController.addToCart);
user_route.get("/shopList",auth.checkBlockedStatus, productController.shopList);



// Cart routes
user_route.post("/addCart-icon",auth.checkBlockedStatus, cartController.addCartIcon);
user_route.get("/cart",auth.checkBlockedStatus, cartController.loadCart);
user_route.delete("/delete-cartItem",auth.checkBlockedStatus, cartController.deleteCartItem);
user_route.post("/cart/qtyInc",auth.checkBlockedStatus, cartController.qtyInc);
user_route.post("/cart/qtyDec",auth.checkBlockedStatus, cartController.qtyDec);



// Checkout and profile routes
user_route.get("/checkout",auth.checkBlockedStatus, auth.isLogin,auth.checkBlockedStatus, cartController.checkoutPage);
user_route.get("/profile",auth.checkBlockedStatus, auth.isLogin, addressController.profilePage);
user_route.post("/addAddress",auth.checkBlockedStatus, auth.isLogin, addressController.addAddress);
user_route.delete(
  "/deletAddress",
  auth.isLogin,
  auth.checkBlockedStatus,
  addressController.deletAddress
);
user_route.get("/editAddress", auth.isLogin,auth.checkBlockedStatus, addressController.loadEditAddress);
user_route.post(
  "/editAddress",
  auth.isLogin,
  auth.checkBlockedStatus,
  addressController.editAddressSave
);
user_route.get("/editProfile", auth.isLogin,auth.checkBlockedStatus, addressController.editProfile);
user_route.post("/editProfile", auth.isLogin,auth.checkBlockedStatus, addressController.updateUserData);




// Order routes
user_route.post("/orderPlaced", auth.isLogin,auth.checkBlockedStatus, orderController.orderComplete);
user_route.get("/order", auth.isLogin,auth.checkBlockedStatus, orderController.orderCompleteLoad);
user_route.get("/orderDetails", auth.isLogin,auth.checkBlockedStatus, orderController.orderDetails);
user_route.put(
  "/cancelOrder/:orderId/:pId",
  auth.isLogin,
  auth.checkBlockedStatus,
  orderController.cancelOrder
);
user_route.post(
  "/order-return/:orderId/:productId",
  auth.isLogin,
  auth.checkBlockedStatus,
  orderController.returnOrder
);



// Search route
user_route.get("/search", auth.checkBlockedStatus,productController.shopList);



// Invoice routes
user_route.get("/invoice", auth.isLogin,auth.checkBlockedStatus, orderController.invoice);
user_route.get("/saveinvoice", auth.isLogin,auth.checkBlockedStatus, orderController.saveInvoice);



// Wishlist routes
user_route.get("/wishlist", auth.isLogin,auth.checkBlockedStatus, wishlistController.loadWishlist);
user_route.post("/addwishlist", auth.isLogin,auth.checkBlockedStatus, wishlistController.addToWishlist);
user_route.post(
  "/wishlistCart",
  auth.isLogin,
  auth.checkBlockedStatus,
  wishlistController.wishlistToCart
);
user_route.delete(
  "/delete-wishlist",
  auth.isLogin,
  auth.checkBlockedStatus,
  wishlistController.deleteWishlist
);



// Coupon routes
user_route.post("/addcouponcode", auth.isLogin,auth.checkBlockedStatus, couponController.addCouponCode);
user_route.post("/remove-coupon", auth.isLogin,auth.checkBlockedStatus, couponController.removeCoupon);



// about page
user_route.get("/about",auth.checkBlockedStatus, userController.aboutPage);


// forget password

user_route.get(
  "/forgetPasswordEmail",
  
  userController.forgetPassEmailVerifyPageLoad
);
user_route.post("/forgetPasswordEmail", userController.verifyEmail);
user_route.get("/ForgetPassVerifyOtp", userController.forgetPassVerifyOtp);
user_route.post("/ForgetPassVerifyOtp", userController.verifyOtp);
user_route.post("/changePassword", userController.changePassword);

user_route.use( errorHandler )
module.exports = user_route;