import mongoose from "mongoose";

/* =========================
TRANSACTION SCHEMA
========================= */

const transactionSchema = new mongoose.Schema({
  
  /* USER */
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  /* TRANSACTION TYPE */
  
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
      "refund"
      
    ]
  },
  
  /* AMOUNT */
  
  amount: {
    type: Number,
    required: true
  },
  
  /* STATUS */
  
  status: {
    type: String,
    enum: [
      "pending",
      "successful",
      "failed",
      "cancelled"
    ],
    default: "pending"
  },
  
  /* REFERENCE */
  
  reference: {
    type: String,
    required: true,
    unique: true
  },
  
  /* DESCRIPTION */
  
  description: {
    type: String,
    default: ""
  },
  
  /* PAYMENT METHOD */
  
  paymentMethod: {
    type: String,
    enum: [
      
      "cash",
      "bank_transfer",
      "wallet",
      "card",
      "pos"
      
    ],
    default: "cash"
  },
  
  /* RECEIPT */
  
  receiptUrl: {
    type: String,
    default: ""
  },
  
  /* ADMIN */
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  /* EXTRA */
  
  metadata: {
    type: Object,
    default: {}
  }
  
},
{
  timestamps: true
});

/* =========================
EXPORT MODEL
========================= */

const Transaction =
  mongoose.model(
    "Transaction",
    transactionSchema
  );

export default Transaction;