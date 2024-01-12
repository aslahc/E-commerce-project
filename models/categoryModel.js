const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  catName: {
    type: String,
    required: true,
  },
  categoryOffer: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    require: true,
  },
});

module.exports = mongoose.model("category", categorySchema);
