import mongoose from "mongoose";

/* =========================
SERVICE SCHEMA
========================= */
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Printing", "NIN", "VTU", "Training", "Registration", "Design", "General"],
    default: "General"
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    required: true,
    default: "/uploads/placeholder.png"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
