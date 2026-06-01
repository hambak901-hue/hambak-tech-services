import express from "express";
import { placeNewOrder, getOrders, getMyOrders, updateOrderStatus, deleteOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   CLIENT & PUBLIC INTERFACE ENTRANCES
   ========================================================== */
// Anyone authenticated can create an order or see their specific order records
router.post("/", protect, placeNewOrder);
router.get("/my", protect, getMyOrders);

/* ==========================================================
   ADMINISTRATIVE MANAGEMENT GATEWAYS
   ========================================================== */
router.get("/", protect, adminOnly, getOrders);
router.put("/:id", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
