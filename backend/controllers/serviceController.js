import Service from "../models/Service.js";

/* ==========================================================
   SERVICES FACTORY: CONSTRUCT NEW SERVICE (ADMIN ONLY)
   ========================================================== */
export const createService = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;

    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({ success: false, message: "Missing explicit service definition values." });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/placeholder.png";

    const serviceData = await Service.create({
      name,
      category,
      description,
      price: Number(price),
      image: imagePath
    });

    return res.status(201).json({
      success: true,
      message: "New workspace service variant mapped successfully.",
      service: serviceData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   SERVICES FACTORY: RENDER ACTIVE SERVICES FETCH
   ========================================================== */
export const getServices = async (req, res) => {
  try {
    const catalog = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
    
    return res.status(200).json({
      success: true,
      count: catalog.length,
      services: catalog
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   SERVICES FACTORY: UPDATE SERVICE SPECS (ADMIN ONLY)
   ========================================================== */
export const updateService = async (req, res) => {
  try {
    const updateTarget = await Service.findById(req.params.id);

    if (!updateTarget) {
      return res.status(404).json({ success: false, message: "Target service catalog asset not located." });
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const revisedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Service configurations updated successfully.",
      service: revisedService
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   SERVICES FACTORY: DELETE / ARCHIVE SERVICE (ADMIN ONLY)
   ========================================================== */
export const deleteService = async (req, res) => {
  try {
    const targetedAsset = await Service.findById(req.params.id);

    if (!targetedAsset) {
      return res.status(404).json({ success: false, message: "Target service reference not found." });
    }

    // Soft delete to protect relational integrity logs down the chain
    targetedAsset.isActive = false;
    await targetedAsset.save();

    return res.status(200).json({
      success: true,
      message: "Service detached and archived from the active frontend menu matrix."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
