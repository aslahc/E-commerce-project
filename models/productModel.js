    const { Double, ObjectId } = require("mongodb");
    const mongoose = require("mongoose");

    const productSchema = new mongoose.Schema({
      productName: {
        type: String,
        required: true,
      },
      Brand: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: ObjectId,
        required: true,
      },

      regularPrice: {
        type: Number,
        required: true,
      },
      salePrice: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      createdOn: {
        type: Date,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
      },
      image: {
        type: Array,
        require: true,
      },
      productOffer: {
        type: Number,
        default: 0,
      },

      is_active: {
        type: Boolean,
        required: true,
      },
    });
    module.exports = mongoose.model("Products", productSchema);
