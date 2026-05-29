import express from "express";
import { createTransaction, getMyTransactions, getAllTransactions } from "../controllers/transactionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/my", protect, getMyTransactions);
router.get("/all", protect, adminOnly, getAllTransactions);

export default router;
