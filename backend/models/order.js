import mongoose from "mongoose";

/* ==========================================================
   CUSTOMER ORDER PROCESSING SCHEMA (UPDATED FOR MULTI-SERVICE & VTU)
   ========================================================== */
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  // Keeps your core design/printing customer metrics alive
  customerName: { type: String, required: function() { return !this.isVtuOrder; } },
  customerEmail: { type: String, required: function() { return !this.isVtuOrder; } },
  customerPhone: { type: String, required: function() { return !this.isVtuOrder; } },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: false // Made optional so standalone VTU transactions don't error out
  },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  message: { type: String, default: "" },
  file: { type: String, default: "" },
  
  // Custom status modifications to smoothly capture VTU delivery flows
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled", "Successful", "Pending Processing", "In Transit"],
    default: "pending"
  },

  /* ==========================================================
     NEW PIPELINE EXTENSIONS: VTU & BULK HARDWARE DISTRIBUTION
     ========================================================== */
  isVtuOrder: { type: Boolean, default: false },
  type: { type: String, default: "Standard Order" }, // E.g., 'Airtime Dispatch', 'Bulk Cargo Order'
  network: { type: String, default: "" },            // MTN, Airtel, GLO, 9mobile
  destination: { type: String, default: "" },        // Target Phone Number
  gatewayReference: { type: String, default: "" },   // API routing tokens
  deliveryMode: { 
    type: String, 
    enum: ["digital", "physical", "none"], 
    default: "none" 
  },
  logisticsDetails: {
    deliveryAddress: { type: String, default: "" },
    contactReceiver: { type: String, default: "" },
    shippingCost: { type: Number, default: 0 }
  },
  generatedPins: [
    {
      pin: { type: String },
      serial: { type: String }
    }
  ]
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
