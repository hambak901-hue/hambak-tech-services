import Service from "../models/Service.js";

/* =========================
CREATE SERVICE
========================= */
export const createService = async (req, res) => {
  try {
    const { name, category, description, price, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Service name and pricing criteria required"
      });
    }

    const service = await Service.create({
      name,
      category,
      description,
      price,
      image: image || "/uploads/placeholder.png"
    });

    res.status(201).json({
      success: true,
      message: "Service item registered successfully",
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET ALL SERVICES
========================= */
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET SINGLE SERVICE
========================= */
export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service matching that ID not found"
      });
    }
    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
UPDATE SERVICE DETAILS
========================= */
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service registry item target missing"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service database item updated smoothly",
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
DELETE SERVICE ITEM
========================= */
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service match not found"
      });
    }

    await service.deleteOne();
    res.status(200).json({
      success: true,
      message: "Service record stripped completely from systems"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
