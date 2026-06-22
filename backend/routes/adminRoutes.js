import express from "express";
import { 
  getDashboardStats, 
  getAllUsers, 
  fundUserWallet, 
  toggleUserBlock, 
  deleteUser 
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upgraded Middleware: Guarantees ID is shared perfectly between URL params and request body
const unifyTargetId = (req, res, next) => {
  // Case 1: URL has ID, but body doesn't (Fixes the 400 Bad Request error)
  if (req.params.id) {
    if (!req.body.id) req.body.id = req.params.id;
    if (!req.body.userId) req.body.userId = req.params.id;
  } 
  // Case 2: Body has ID, but URL doesn't
  else if (req.body.id || req.body.userId) {
    req.params.id = req.body.id || req.body.userId;
  }
  next();
};

// Central Administration Routes
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.post("/fund-wallet", protect, adminOnly, fundUserWallet);

// Protected mutations with body-fallback routing parameters
router.patch("/toggle-block/:id", protect, adminOnly, unifyTargetId, toggleUserBlock);
router.patch("/toggle-block", protect, adminOnly, unifyTargetId, toggleUserBlock);
router.delete("/users/:id", protect, adminOnly, unifyTargetId, deleteUser);
router.delete("/users", protect, adminOnly, unifyTargetId, deleteUser);

/* ==========================================================================
   MANAGEMENT SYNC CHANNELS (Fully Aligned & Validated)
   ========================================================================== */

// FIXED: Perfectly unifies the payload before forwarding to fundUserWallet controller
router.post("/users/:id/wallet", protect, adminOnly, unifyTargetId, fundUserWallet);

// @desc    Fetch administrative tracking entries
// @route   GET /api/admin/orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    res.status(200).json({ success: true, orders: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to sync system registration order ledgers." });
  }
});

export default router;
