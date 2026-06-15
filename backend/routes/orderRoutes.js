import express from "express";
import { placeNewOrder, getOrders, getMyOrders, updateOrderStatus, deleteOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // IMPORTED: Multer parser link

const router = express.Router();

/* ==========================================================
   CLIENT & PUBLIC INTERFACE ENTRANCES
   ========================================================== */
// Intercepted with upload middleware to parse multi-part form payloads and capture files
router.post("/", protect, upload.single("file"), placeNewOrder);
router.get("/my", protect, getMyOrders);

/* ==========================================================
   ADMINISTRATIVE MANAGEMENT GATEWAYS
   ========================================================== */
router.get("/", protect, adminOnly, getOrders);
router.put("/:id", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
