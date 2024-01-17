const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Coupon = require("../models/couponModel");

// Render the addCoupon page
const loadAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.error("Error in loadAddCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Add a new coupon
const addCoupon = async (req, res) => {
  try {
    const { name, couponCode, percentageDiscount, minimumAmount, expiryDate } =
      req.body;
    const user = req.session.user_id;
    console.log(couponCode);
    const couponData = await Coupon.find({ code: couponCode });
    console.log(couponData);
    if (couponData.length === 0) {
      // Check if no matching documents are found
      console.log("entering to SAVE");
      const coupon = await new Coupon({
        name,
        code: couponCode,
        percentageDiscount,
        minimumAmount,
        createdOn: Date.now(),
        expiryDate,
        user,
      });

      await coupon.save();

      res.redirect("/admin/listCoupon");
    } else {
      console.log("rendering");
      res.render("addCoupon", {
        message: "This coupon code already exists",
      });
    }
  } catch (error) {
    console.error("Error in addCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Display the list of coupons
const listCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find({});
    res.render("couponManagement", { coupon });
  } catch (error) {
    console.error("Error in listCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Load the editCoupon page with details of a specific coupon
const loadEditCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).send("Coupon not found");
    }

    res.render("editCoupon", { coupon });
  } catch (error) {
    console.error("Error in loadEditCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Update an existing coupon
const editCoupon = async (req, res) => {
  try {
    const { name, couponCode, percentageDiscount, minimumAmount, expiryDate } =
      req.body;
    const coupenData = await Coupon.findByIdAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          name,
          code: couponCode,
          percentageDiscount,
          minimumAmount,
          createdOn: Date.now(),
          expiryDate,
        },
      }
    );

    if (coupenData) {
      res.redirect("/admin/listCoupon");
    }
  } catch (error) {
    console.error("Error in editCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await Coupon.deleteOne({ _id: id });

    res.status(200).json("coupon deleted");
  } catch (error) {
    console.error("Error in deleteCoupon:", error.message);
    res.status(500).send("Internal Server Error");
  }
};


// admin side add  coupon code 


const addCouponCode = async (req, res) => {
  try {
    const { subtotal, couponCode } = req.body;
    const numericSubtotal = parseFloat(subtotal.replace(/[$,]/g, ""));

    req.session.couponCode = couponCode;
    userId = req.session.user_id;

    const validCoupon = await Coupon.findOne({ code: couponCode });

    if (validCoupon) {
      if (
        validCoupon.minimumAmount &&
        numericSubtotal > validCoupon.minimumAmount
      ) {
        const userUsedCoupon = validCoupon.used_coupons.some((usedCoupon) =>
          usedCoupon.userId.equals(userId)
        );

        if (userUsedCoupon) {
          res.status(400).json({
            success: false,
            message: "Sorry, the coupon has already been used",
          });
        } else {
          if (validCoupon.percentageDiscount) {
            const discountAmount =
              (numericSubtotal * validCoupon.percentageDiscount) / 100;
            res.status(200).json({
              success: true,
              message: "Coupon is valid",
              discountAmount,
            });
          } else {
            res.status(200).json({
              success: true,
              message: "Coupon is valid",
              discountAmount: validCoupon.offerPrice, // Use the existing logic for fixed offer coupons
            });
          }
        }
      } else {
        res.status(400).json({
          success: false,
          message: `minium amount ${validCoupon.minimumAmount}`,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid Coupon",
      });
    }
  } catch (error) {
    console.error("Error in addCouponCode:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// Remove a coupon code
const removeCoupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const validCoupon = await Coupon.findOne({ code: couponCode });

    res
      .status(200)
      .json({ success: true, discountAmount: validCoupon.percentageDiscount });
  } catch (error) {
    console.error("Error in removeCoupon:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  loadAddCoupon,
  addCoupon,
  listCoupon,
  loadEditCoupon,
  editCoupon,
  deleteCoupon,
  addCouponCode,
  removeCoupon,
};
