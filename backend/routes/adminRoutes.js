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

// Central Administration Routes
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.post("/fund-wallet", protect, adminOnly, fundUserWallet);
router.patch("/toggle-block/:id", protect, adminOnly, toggleUserBlock);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
