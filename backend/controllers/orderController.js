import Order from "../models/Order.js";
import Service from "../models/Service.js";
import path from "path";

/* =========================
CREATE ORDER
========================= */
export const createOrder = async (req, res) => {
  try {
    const { service, quantity, amount, message, customerName, customerEmail, customerPhone } = req.body;

    /* VALIDATE TARGET SERVICE */
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "The requested service category was not found"
      });
    }

    /* HANDLE INCOMING COMPLIANT FILES (express-fileupload architecture) */
    let uploadedFilePath = "";
    if (req.files && req.files.file) {
      const file = req.files.file;
      const extension = path.extname(file.name);
      const fileName = `order-${Date.now()}${extension}`;
      const uploadPath = path.join(process.cwd(), "uploads", fileName);

      await file.mv(uploadPath);
      uploadedFilePath = `/uploads/${fileName}`;
    }

    /* LOG ORDER INTO MONGODB MATRIX */
    const order = await Order.create({
      user: req.user ? req.user.id : null, // Links to profile if logged in
      customerName: customerName || req.user?.name,
      customerEmail: customerEmail || req.user?.email,
      customerPhone: customerPhone || req.user?.phone,
      service,
      quantity: Number(quantity) || 1,
      amount: Number(amount) || serviceData.price,
      message,
      file: uploadedFilePath
    });

    res.status(201).json({
      success: true,
      message: "Order routed and placed successfully inside dashboard",
      order
    });
  } catch (error) {
    console.error("Order Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET ALL SYSTEM ORDERS (ADMIN VIEW)
========================= */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("service", "name category price")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET USER OWN ORDERS (CLIENT VIEW)
========================= */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
UPDATE ORDER STATUS (MANAGEMENT TRACE)
========================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Target order record missing"
      });
    }

    order.status = req.body.status || order.status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order workflow state updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
DELETE ORDER RECORD
========================= */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Target order reference not found"
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order registry cleared cleanly from host nodes"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
