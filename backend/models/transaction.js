import mongoose from "mongoose";

/* ==========================================================
   TRANSACTION DATA ENGINE SCHEMA
   ========================================================== */
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      "deposit",
      "withdrawal",
      "transfer",
      "payment",
      "wallet_funding",
      "service_payment",
      "vtu",
      "pos",
      "printing",
      "nin",
      "refund"
    ]
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "successful", "failed", "cancelled"],
    default: "pending"
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ""
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "wallet", "card", "pos"],
    default: "wallet"
  },
  receiptUrl: {
    type: String,
    default: ""
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;
