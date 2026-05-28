import express from "express";

import {
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService,
  searchServices
} from "../controllers/serviceController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
PUBLIC ROUTES
========================= */

router.get(
  "/",
  getServices
);

router.get(
"/search",
searchServices
);

router.get(
  "/:id",
  getSingleService
);

/* =========================
ADMIN ROUTES
========================= */

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createService
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateService
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteService
);

export default router;