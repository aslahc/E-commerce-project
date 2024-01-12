const express = require("express");
const admin_route = express();
const path = require("path");

const config = require("../config/config");

// Controllers
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const bannerController = require("../controllers/bannerController");
// error handler 

const errorHandler = require("../middleware/errorHandeler");
// Middleware setup
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

// Set view engine and views directory
admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

// Multer setup for file uploads
const upload = require("../multer/multer");
admin_route.use(upload.array("image", 4));

// Session setup
const session = require("express-session");
admin_route.use(
  session({
    secret: "mysitesessionsecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware for admin authentication
const adminAuthMiddleware = require("../middleware/adminAuth");

// Authentication middleware
const auth = require("../middleware/adminAuth");

// Define routes
admin_route.get(
  "/",
  adminAuthMiddleware.adminLoggedIn,
  adminController.loadDash
);

// User routes
admin_route.get(
  "/users",
  adminAuthMiddleware.adminLoggedIn,
  adminController.loadUsersList
);
admin_route.get(
  "/searchUser",
  adminAuthMiddleware.adminLoggedIn,
  adminController.loadUsersList
);
admin_route.put(
  "/users/:userId/block",
  adminAuthMiddleware.adminLoggedIn,
  adminController.blockUser
);
admin_route.get(
  "/logout",
  adminAuthMiddleware.adminLoggedIn,
  adminController.logOut
);

// Product routes
admin_route.get(
  "/addProducts",
  adminAuthMiddleware.adminLoggedIn,
  productController.addProductPageLoad
);
admin_route.post(
  "/addProducts",
  adminAuthMiddleware.adminLoggedIn,
  productController.publishProduct
);
admin_route.get(
  "/productList",
  adminAuthMiddleware.adminLoggedIn,
  productController.loadProductList
);
admin_route.get(
  "/edit-product",
  adminAuthMiddleware.adminLoggedIn,
  productController.loadEditProduct
);
admin_route.post(
  "/updateProduct",
  adminAuthMiddleware.adminLoggedIn,
  productController.updateProducts
);
admin_route.delete(
  "/delete-product",
  adminAuthMiddleware.adminLoggedIn,
  productController.deleteProduct
);
admin_route.post(
  "/delete-single-image",
  adminAuthMiddleware.adminLoggedIn,
  productController.deleteSingleImage
);
admin_route.get(
  "/searchProduct",
  adminAuthMiddleware.adminLoggedIn,
  productController.loadProductList
);

// Category routes
admin_route.get(
  "/categories",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.loadCategoriesPage
);
admin_route.get(
  "/searchCategory",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.loadCategoriesPage
);
admin_route.delete(
  "/delete-category",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.deleteCategory
);
admin_route.post(
  "/categories",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.addCategory
);
admin_route.post(
  "/update-category",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.updateCategory
);

// Order routes
admin_route.get(
  "/orderDetails",
  adminAuthMiddleware.adminLoggedIn,
  orderController.adminOrderManagement
);
admin_route.get(
  "/order-details",
  adminAuthMiddleware.adminLoggedIn,
  orderController.adminOrderDetails
);
admin_route.post(
  "/order-details",
  adminAuthMiddleware.adminLoggedIn,
  orderController.adminStatusChange
);
admin_route.patch(
  "/adminCancelOrder/:orderId/:pId",
  adminAuthMiddleware.adminLoggedIn,
  orderController.adminCancelOrder
);

// Coupon routes
admin_route.get(
  "/listCoupon",
  adminAuthMiddleware.adminLoggedIn,
  couponController.listCoupon
);
admin_route.get(
  "/editCoupon",
  adminAuthMiddleware.adminLoggedIn,
  couponController.loadEditCoupon
);
admin_route.post(
  "/editCoupen",
  adminAuthMiddleware.adminLoggedIn,
  couponController.editCoupon
);
admin_route.get(
  "/coupon",
  adminAuthMiddleware.adminLoggedIn,
  couponController.loadAddCoupon
);
admin_route.post(
  "/addcoupon",
  adminAuthMiddleware.adminLoggedIn,
  couponController.addCoupon
);
admin_route.delete(
  "/deleteCoupon",
  adminAuthMiddleware.adminLoggedIn,
  couponController.deleteCoupon
);

// slae report
admin_route.get(
  "/saleReport",
  adminAuthMiddleware.adminLoggedIn,
  orderController.saleReportPage
);
admin_route.get(
  "/download-pdf",
  adminAuthMiddleware.adminLoggedIn,
  orderController.downloadPdf
);
admin_route.get(
  "/download-excel",
  adminAuthMiddleware.adminLoggedIn,
  orderController.downloadExcel
);

// chart
admin_route.get(
  "/sales-data",
  adminAuthMiddleware.adminLoggedIn,
  orderController.saleChart
);

// offer
admin_route.put(
  "/submitOffer",
  adminAuthMiddleware.adminLoggedIn,
  productController.addProductOffer
);
admin_route.put(
  "/removeProductOffer",
  adminAuthMiddleware.adminLoggedIn,
  productController.removeProductOffer
);

admin_route.put(
  "/submitCategoryOffer",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.addCategoryOffer
);

admin_route.put(
  "/products/remove-category-offer",
  adminAuthMiddleware.adminLoggedIn,
  categoryController.removeCategoryOffer
);

// banner

admin_route.get(
  "/banners",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.loadAddBanner
);

admin_route.post(
  "/createBanner",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.createBanner
);
admin_route.get(
  "/bannerList",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.bannerList
);
admin_route.get(
  "/editBanner",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.bannerEdit
);

admin_route.post(
  "/updateBanner",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.updateBanner
);

admin_route.delete(
  "/deleteBanner",
  adminAuthMiddleware.adminLoggedIn,
  bannerController.deleteBanner
);


admin_route.use( errorHandler )
// Export the admin_route
module.exports = admin_route;
