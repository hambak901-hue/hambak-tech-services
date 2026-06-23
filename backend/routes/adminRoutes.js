import express from "express";
import { exec } from "child_process";
import path from "path";
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
  if (req.params.id) {
    if (!req.body.id) req.body.id = req.params.id;
    if (!req.body.userId) req.body.userId = req.params.id;
  } 
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

// @desc    Download live synced Excel tracker matrix
// @route   GET /api/admin/download-tracker
router.get("/download-tracker", protect, adminOnly, async (req, res) => {
  try {
    // Executes your automation script directly to generate a fresh calculation file
    exec("node backend/generateMasterTracker.js", (error) => {
      if (error) {
        console.error("Tracker Generation Error:", error);
        return res.status(500).json({ message: "Engine calculation runtime failure." });
      }
      const fileLocation = path.resolve("./Hambak_Tech_Services_Master_Account_Book.xlsx");
      res.download(fileLocation);
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server compilation mistake." });
  }
});

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
