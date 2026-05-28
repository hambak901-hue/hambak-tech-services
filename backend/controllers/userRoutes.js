import express from "express";

import {
  getUsers,
  deleteUser
} from "../controllers/userController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
GET ALL USERS
========================= */

router.get(
  "/",
  protect,
  adminOnly,
  getUsers
);

/* =========================
DELETE USER
========================= */

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteUser
);

/* =========================
PROFILE ROUTE
========================= */

router.get(
  "/profile",
  protect,
  async (req, res) => {

    res.status(200).json({

      success: true,

      message:
        "Protected Profile Route",

      user: req.user

    });

  }
);

export default router;