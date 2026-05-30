import express from "express";
import { 
  createService, 
  getServices, 
  updateService, 
  deleteService 
} from "../controllers/serviceController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Adjust path if needed

const router = express.Router();

// Core public or protected routes
router.route("/")
  .get(getServices)
  .post(protect, admin, createService);

router.route("/:id")
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);
  // .get(getSingleService); // Kept commented out until defined in controller

export default router;

