import express from "express";
import { handleContactSubmit } from "../controllers/contactController.js";

const router = express.Router();

// Route configuration mapping the POST request pipeline
router.post("/contact", handleContactSubmit);

export default router;
