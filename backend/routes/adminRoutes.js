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

// Route Parameter Extractor Middleware (Guarantees :id is captured even if sent in req.body)
const unifyTargetId = (req, res, next) => {
  if (!req.params.id && (req.body.id || req.body.userId)) {
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

export default router;
