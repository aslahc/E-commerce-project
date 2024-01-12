const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId, // Fix: Use mongoose.Schema.Types.ObjectId
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Fix: Use mongoose.Schema.Types.ObjectId
    default: null,
  },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
