import express from "express";
import { 
  createService, 
  getServices, 
  updateService, 
  deleteService 
} from "../controllers/serviceController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Protected base endpoints
router.route("/")
  .get(getServices)
  .post(protect, admin, createService);

router.route("/:id")
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);

export default router;

