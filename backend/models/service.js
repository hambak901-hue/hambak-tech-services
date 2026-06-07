import mongoose from "mongoose";

/* ==========================================================
   ECOSYSTEM CORE SERVICE LISTING SCHEMA
   ========================================================== */
const pricingItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  priceDisplay: { type: String, required: true }
});

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "ICT Training Services", 
      "Website Development", 
      "Graphic Design", 
      "Computer Services", 
      "Printing & Documentation", 
      "Business Documentation", 
      "Digital Marketing", 
      "ICT Consultancy", 
      "VTU Services", 
      "POS Services", 
      "Ajo / Cooperative Management", 
      "Future Services"
    ]
  },
  status: {
    type: String,
    enum: ["active", "coming-soon"],
    default: "active"
  },
  pricing: [pricingItemSchema] // Embedded sub-items with their corresponding rates
}, {
  timestamps: true
});

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default Service;
