const Category = require("../models/categoryModel");
const Wishlist = require("../models/wishlist");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");

const loadWishlist = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    const userId = req.session.user_id;
    const wishlist = userId
      ? await Wishlist.find({ user_id: userId })
      : await Wishlist.find({ user_id: null });

    const productId = wishlist.map((wishlist) => wishlist.product_id);
    const products = await Products.find({ _id: { $in: productId } });

    res.render("wishlist", {
      loggedIn,
      products,
      category: categoryData,
      wishlist,
    });
  } catch (error) {
    console.error("Error loading wishlist:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await Products.findById(productId);

    if (!productData) {
      return res.status(404).json("Product not found");
    }

    const { _id: product_id, productName, salePrice } = productData;
    const user_id = req.session.user_id;

    const wishlist = new Wishlist({
      product_id,
      productName,
      price: salePrice,
      user_id,
    });

    const wishlistData = await wishlist.save();

    if (wishlistData) {
      res.json("Wishlist added successfully");
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const wishlistToCart = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Products.findById(id);

    if (!productData) {
      return res.status(404).json("Product not found");
    }

    const { _id: product_id, productName, salePrice, category } = productData;
    const quantity = 1;
    const user_id = req.session.user_id;

    const cartData = await Cart.findOne({ user_id, product_id });

    if (cartData) {
      if (cartData.quantity >= productData.stock) {
        // Return an error or handle as needed
        console.error("Error: Quantity exceeds available stock");
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      } else {
      const updateCart = await Cart.findOneAndUpdate(
        { user_id, product_id },
        { $inc: { quantity: quantity } },
        { new: true }
      );}
    } else {
      if (productData.stock == 0) {
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      }else {
      const cart = new Cart({
        product_id,
        productName,
        quantity,
        category,
        price: salePrice,
        user_id,
        addedAt: Date.now(),
      });

      await cart.save();
    }
  }
    res.status(200).json("Product added to cart successfully");
  } catch (error) {
    console.error("Error in wishlistToCart:", error.message);
    res.status(500).json("Internal Server Error");
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const id = req.body.id;
    const result = await Wishlist.deleteOne({ product_id: id });

    if (result) {
      res.status(200).json("wishlist product deleted");
    }
  } catch (error) {
    console.error("Error deleting from wishlist:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadWishlist,
  addToWishlist,
  wishlistToCart,
  deleteWishlist,
};
