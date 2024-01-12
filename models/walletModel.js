const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user_id: {
    type: ObjectId,
    default: null,
  },

  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  transactions: [
    {
      amount: { type: Number, required: true },
      reason: { type: String, default: null },
      transactionType: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      date: {
        type: String,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);
