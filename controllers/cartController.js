const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const Address = require("../models/AddressModel");
const Coupon = require("../models/couponModel");
const loadCart = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const user = req.session.user_id;
    const cart = user
      ? await Cart.find({ user_id: user })
      : await Cart.find({ user_id: null });
    const ProductId = cart.map((cart) => cart.product_id);
    const products = await Products.find({ _id: { $in: ProductId } });
    res.render("cart", {
      loggedIn,
      category: categoryData,
      cart,
      products,
    });
  } catch (error) {
    console.error("Error in loadCart:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const addToCart = async (req, res) => {
  try {
    const id = req.params.id;

    const productData = await Products.findById(id);
    const product_id = productData._id;

    const productName = productData.productName;
    const quantity = req.body.quantity;
    const price = productData.salePrice;
    const user_id = req.session.user_id;
    const addedAt = Date.now();

    const cartData = await Cart.findOne({
      user_id: user_id,
      product_id: product_id,
    });

    if (cartData) {
      if (cartData.quantity >= productData.stock) {
        console.error("Error: Quantity exceeds available stock");
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const updateCart = await Cart.findOneAndUpdate(
          { user_id: user_id, product_id: product_id },
          { $inc: { quantity: quantity } },
          { new: true }
        );
      }
    } else {
      if (productData.stock == 0) {
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const cart = new Cart({
          product_id: product_id,
          productName: productName,
          quantity: quantity,
          category: productData.category,
          price: price,
          user_id: user_id,
          addedAt: addedAt,
        });
        await cart.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in addToCart:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const addCartIcon = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Products.findById(id);
    const product_id = productData._id;
    const productName = productData.productName;
    const quantity = 1;
    const price = productData.salePrice;
    const user_id = req.session.user_id;
    const addedAt = Date.now();
    const cartData = await Cart.findOne({
      user_id: user_id,
      product_id: product_id,
    });

    if (cartData) {
      if (cartData.quantity >= productData.stock) {
        // Return an error or handle as needed
        console.error("Error: Quantity exceeds available stock");
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const updateCart = await Cart.findOneAndUpdate(
          { user_id: user_id, product_id: product_id },
          { $inc: { quantity: quantity } },
          { new: true }
        );
      }
    } else {
      if (productData.stock == 0) {
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
        const cart = new Cart({
          product_id: product_id,
          productName: productName,
          quantity: quantity,
          category: productData.category,
          price: price,
          user_id: user_id,
          addedAt: addedAt,
        });
        await cart.save();
      }
    }
    res.status(200).json({ success: "product added to the art" });
  } catch (error) {
    console.error("Error in addCartIcon:", error.message);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const id = req.query.id;

    const result = await Cart.deleteOne({ product_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).send("Cart item not found");
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("Error in deleteCartItem:", error);
    res.status(500).send("Internal Server Error");
  }
};
const updateQuantity = async (req, res, quantityModifier) => {
  try {
    const product_id = req.query.id;
    const productData = await Products.findById(product_id);
    const productStock = productData.stock;
    const quantity = quantityModifier;
    const user_id = req.session.user_id;

    // Calculate the new quantity after the update
    const existingCart = await Cart.findOne({
      user_id: user_id,
      product_id: product_id,
    });

    if (!existingCart) {
      return res.status(400).json({
        error: "Cart not found for the specified user and product.",
      });
    }

    const newQuantity = existingCart.quantity + quantity;

    // Check if the new quantity exceeds the available stock
    if (newQuantity > productStock) {
      // Quantity exceeds available stock or is less than or equal to zero
      return res.status(500).json({
        error: "Out Of stock",
        stock: productStock,
      });
    }
    if (newQuantity <= 0) {
      return res.status(200).json({
        error: "Quantity must be at least 1",
        stock: productStock,
      });
    }

    // Proceed with updating the quantity
    const updatedCart = await Cart.findOneAndUpdate(
      { user_id: user_id, product_id: product_id },
      { $inc: { quantity: quantity } },
      { new: true }
    );

    res.json({ quantity: updatedCart.quantity });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const qtyInc = async (req, res) => {
  try {
    await updateQuantity(req, res, 1);
  } catch (error) {
    console.error("Error incrementing quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const qtyDec = async (req, res) => {
  try {
    await updateQuantity(req, res, -1);
  } catch (error) {
    console.error("Error decrementing quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkoutPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const cartData = await Cart.find({ user_id: userId });
    console.log(cartData);

    const addressData = await Address.find();
    const ProductId = cartData.map((cart) => cart.product_id);
    const products = await Products.find({ _id: { $in: ProductId } });
    const allCoupons = await Coupon.find({});

    // Get used coupons by the user
    const usedCoupons = cartData.map((cart) => cart.used_coupons).flat();

    // Filter out coupons where the user's ID is present in used_coupons
    const availableCoupons = allCoupons.filter((coupon) => {
      const isUsedByUser = coupon.used_coupons.some((usedCoupon) =>
        usedCoupon.userId.equals(userId)
      );
      return !isUsedByUser;
    });

    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    if (cartData.length > 0) {
      res.render("checkout", {
        loggedIn,
        category: categoryData,
        address: addressData,
        cart: cartData,
        product: products,
        coupon: availableCoupons,
      });
    } else {
      res.render("cart", {
        loggedIn,
        category: categoryData,
        cart: cartData,
        products: products,
        message: "cart is empty",
      });
    }
  } catch (error) {
    console.error("Error in checkoutPage:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadCart,
  addToCart,
  addCartIcon,
  deleteCartItem,
  updateQuantity,
  qtyInc,
  qtyDec,
  checkoutPage,
};
