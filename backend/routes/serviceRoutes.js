import express from "express";
const router = express.Router();
import mongoose from "mongoose";

// Safe dynamic reference handling
const Service = mongoose.models.Service;
const Package = mongoose.models.Package;

// @desc    Fetch all operational company services
// @route   GET /api/services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to read database operational entries." });
  }
});

// @desc    Fetch target bundle strategy configurations
// @route   GET /api/services/packages
router.get("/packages", async (req, res) => {
  try {
    const bundles = await Package.find({});
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ message: "Failed to read operational catalog bundles." });
  }
});

export default router;
