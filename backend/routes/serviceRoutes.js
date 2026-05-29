import express from "express";
import { createService, getServices, getSingleService, updateService, deleteService } from "../controllers/serviceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getSingleService);
router.post("/create", protect, adminOnly, createService);
router.put("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

export default router;
