import express from "express";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
ADMIN DASHBOARD
========================= */

router.get(
  "/dashboard",
  protect,
  adminOnly,
  (req, res) => {

    res.status(200).json({

      success: true,

      message:
      "Welcome Admin Dashboard",

      admin: req.user

    });

  }
);

export default router;