const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: {
    type: [{ filename: String }], // Change type to an array of objects
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String, // Correct the typo in the field name
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
