import express from "express";
import { 
  createTransaction, 
  getMyTransactions, 
  getAllTransactions,
  initializePaystackDeposit,
  verifyPaystackDeposit
} from "../controllers/transactionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Paystack Gateway Hook Channels
router.post("/paystack/initialize", protect, initializePaystackDeposit);
router.post("/paystack/verify", protect, verifyPaystackDeposit);

// Base Financial Records Operations
router.post("/", protect, createTransaction);
router.get("/my", protect, getMyTransactions);
router.get("/all", protect, adminOnly, getAllTransactions);

export default router;
