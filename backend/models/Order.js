import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  message: { type: String, default: "" },
  file: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
