import express from "express";
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService 
} from "../controllers/serviceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base collection mapping endpoints
router.route("/")
  .get(getServices)
  .post(protect, adminOnly, createService);

// Specific resource target mapping endpoints
router.route("/:id")
  .get(getSingleService)
  .put(protect, adminOnly, updateService)
  .delete(protect, adminOnly, deleteService);

export default router;
