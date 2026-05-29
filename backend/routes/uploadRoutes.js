import express from "express";
import { uploadFile, deleteFile } from "../controllers/uploadController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadFile);
router.delete("/:filename", protect, adminOnly, deleteFile);

export default router;
