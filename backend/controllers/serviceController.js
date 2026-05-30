import mongoose from "mongoose";

// Simple baseline inline schema to prevent loading dependencies if not built yet
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ["NIN", "Printing", "VTU", "Other"] },
  price: { type: Number, required: true, default: 0 },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

// @desc    Get all available services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single service profile details
// @route   GET /api/services/:id
// @access  Public
export const getSingleService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Target service listing not found." });
    }
    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new ecosystem service listing
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res, next) => {
  try {
    const { name, category, price, description } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: "Please provide service name, category, and price parameters." });
    }

    const service = await Service.create({
      name,
      category,
      price: Number(price),
      description: description || ""
    });

    res.status(201).json({
      success: true,
      message: "Service listing generated successfully inside cluster",
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing service configuration
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Target service listing not found." });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Service configurations updated successfully",
      service: updatedService
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Deactivate a system service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Target service listing not found." });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: "Service removed cleanly from matrix database structures." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
