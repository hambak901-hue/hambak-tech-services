import express from "express";

import {
  
  uploadFile,
  deleteFile
  
} from "../controllers/uploadController.js";

import {
  
  protect,
  adminOnly
  
} from "../middleware/authMiddleware.js";

/* =========================
ROUTER
========================= */

const router = express.Router();

/* =========================
UPLOAD FILE
========================= */

router.post(
  "/",
  protect,
  uploadFile
);

/* =========================
DELETE FILE
========================= */

router.delete(
  "/:filename",
  protect,
  adminOnly,
  deleteFile
);

/* =========================
EXPORT
========================= */

export default router;