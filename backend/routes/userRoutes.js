import express from "express";

import {
  protect
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
GET ALL USERS
========================= */

router.get(
  "/",
  async (req, res) => {

    try {

      res.status(200).json({

        success: true,

        users: [

          {
            name: "Admin User",
            email: "admin@hambak.com",
            role: "admin"
          }

        ]

      });

    } catch (error) {

      res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }
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