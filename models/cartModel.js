const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  product_id: {
    type: ObjectId,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  user_id: {
    type: ObjectId,
    default: null,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
