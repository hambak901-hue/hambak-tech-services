import express from "express";

const router = express.Router();

/* =========================
TEST TRANSACTION ROUTE
========================= */

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Transaction Route Working"
  });
});

/* =========================
EXPORT ROUTER
========================= */

export default router;