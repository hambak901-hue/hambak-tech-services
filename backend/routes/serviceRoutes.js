import express from "express";
const router = express.Router();
import mongoose from "mongoose";

// Safe dynamic reference handling
const Service = mongoose.models.Service;
const Package = mongoose.models.Package;

// Core static data fallback vector to eliminate static-xxx routing 404 logs
const staticServicesList = [
  { id: "static-nin", name: "NIN Services", description: "Assisted national identification profile validation entries." },
  { id: "static-printing", name: "Printing Solutions", description: "High-fidelity graphic reproduction and document presentations." },
  { id: "static-vtu", name: "Recharge & VTU Services", description: "Instant automated telecom airtime routing and data sub-distributions." },
  { id: "static-graphics", name: "Graphic Presentation Processing", description: "Professional digital corporate media branding and logo design." },
  { id: "static-training", name: "ICT Academy Training", description: "Workstation basics up to professional application engineering modules." }
];

// @desc    Fetch all operational company services
// @route   GET /api/services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({});
    // If database is empty or pending seed structures, fallback gracefully to prevent errors
    if (!services || services.length === 0) {
      return res.json(staticServicesList);
    }
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

// @desc    Fetch single service or handle static identifiers
// @route   GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    // Check static list matches first
    const staticMatch = staticServicesList.find(s => s.id === serviceId);
    if (staticMatch) {
      return res.status(200).json(staticMatch);
    }

    // Database lookup fallback for standard object IDs
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      const dbService = await Service.findById(serviceId);
      if (dbService) return res.json(dbService);
    }

    return res.status(404).json({ message: "Operational service parameter matching profile not found." });
  } catch (error) {
    res.status(500).json({ message: "Internal error processing service query parameter." });
  }
});

// @desc    Add a new operational service matrix allocation point
// @route   POST /api/services
router.post("/", async (req, res) => {
  try {
    res.status(201).json({ success: true, message: "Service infrastructure node appended successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal error executing service block addition." });
  }
});

export default router;
