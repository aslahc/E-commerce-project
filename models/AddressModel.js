const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  addressLine: {
    type: String,
    required: true,
  },
  areaStreet: {
    type: String,
    required: true,
  },
  ladmark: {
    type: String,
    required: true,
  },
  townCity: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  adressType: {
    type: String,
    default: "Home",
  },
  user_id: {
    type: ObjectId,
    default: null,
  },
  main: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Address", addressSchema);
