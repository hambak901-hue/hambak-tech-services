import express from "express";

import {

createOrder,
getOrders,
updateOrderStatus,
deleteOrder

} from "../controllers/orderController.js";

import {

protect,
adminOnly

} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
PUBLIC
========================= */

router.post(
"/",
upload.single("file"),
createOrder
);

/* =========================
ADMIN
========================= */

router.get(
"/",
protect,
adminOnly,
getOrders
);

router.put(
"/:id",
protect,
adminOnly,
updateOrderStatus
);

router.delete(
"/:id",
protect,
adminOnly,
deleteOrder
);

export default router;