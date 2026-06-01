import express from "express";
import { 
  createService, 
  getServices, 
  updateService, 
  deleteService 
} from "../controllers/serviceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Protected base endpoints
router.route("/")
  .get(getServices)
  .post(protect, adminOnly, createService);

router.route("/:id")
  .put(protect, adminOnly, updateService)
  .delete(protect, adminOnly, deleteService);

export default router;
