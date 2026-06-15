import Order from "../models/Order.js";         // Verified PascalCase path
import Service from "../models/Service.js";     // Verified PascalCase path
import User from "../models/userModel.js";      // Linked to your unified account schema file
import Transaction from "../models/transaction.js";

/* ==========================================================
   ORDER MATRIX: PROCESS CHECKOUT & BALANCE LOGS
   ========================================================== */
export const placeNewOrder = async (req, res) => {
  try {
    const { serviceId, quantity, message, customerName, customerEmail, customerPhone } = req.body;

    if (!serviceId) {
      return res.status(400).json({ success: false, message: "Target service mapping reference required." });
    }

    const serviceAsset = await Service.findById(serviceId);
    if (!serviceAsset || !serviceAsset.isActive) {
      return res.status(404).json({ success: false, message: "Service is currently decommissioned or unavailable." });
    }

    const orderQuantity = Number(quantity) || 1;
    const computedTotalCost = serviceAsset.price * orderQuantity;
    const clientAccountID = req.user._id;

    // 1. Verify liquidity profiles within core data sheets
    const customerProfile = await User.findById(clientAccountID);
    if (customerProfile.wallet < computedTotalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Operation requires ₦${computedTotalCost.toLocaleString()}, but wallet balance holds ₦${customerProfile.wallet.toLocaleString()}.`
      });
    }

    // 2. Safely isolate path details extracted via multipart form processor
    const documentAssetPath = req.file ? `/uploads/${req.file.filename}` : "";

    // 3. Commit ledger financial updates
    customerProfile.wallet -= computedTotalCost;
    await customerProfile.save();

    const orderReferenceCode = `HTS-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Trace atomic footprints with financial tracking indices
    await Transaction.create({
      user: clientAccountID,
      type: "service_payment",
      amount: computedTotalCost,
      status: "successful",
      reference: orderReferenceCode,
      description: `Payment for ${orderQuantity}x ${serviceAsset.name} (${serviceAsset.category})`,
      paymentMethod: "wallet"
    });

    // 5. Build tracking records seamlessly inside database collections
    const serviceOrder = await Order.create({
      user: clientAccountID,
      customerName: customerName || customerProfile.name,
      customerEmail: customerEmail || customerProfile.email,
      customerPhone: customerPhone || customerProfile.phone,
      service: serviceId,
      quantity: orderQuantity,
      amount: computedTotalCost,
      message: message || "Standard automated operations request sequence.",
      file: documentAssetPath, // Saves perfectly to your unified directory tracking
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully. Balances deducted from core profile wallet assets.",
      order: serviceOrder,
      updatedBalance: customerProfile.wallet
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ORDER MATRIX: VIEW CURRENT ACCOUNT ORDERS FEED
   ========================================================== */
export const getMyOrders = async (req, res) => {
  try {
    const history = await Order.find({ user: req.user._id })
      .populate("service", "name category price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      orders: history
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ORDER MATRIX: MANAGING ORDER STATE MODES (ADMIN ONLY)
   ========================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStates = ["pending", "processing", "completed", "cancelled"];

    if (!allowedStates.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid tracking target state designation." });
    }

    const executionOrder = await Order.findById(req.params.id);
    if (!executionOrder) {
      return res.status(404).json({ success: false, message: "Target order reference dataset missing." });
    }

    // Dynamic processing rule: Re-inflate client's wallet balances if order drops to canceled status
    if (status === "cancelled" && executionOrder.status !== "cancelled") {
      const associatedClient = await User.findById(executionOrder.user);
      if (associatedClient) {
        associatedClient.wallet += executionOrder.amount;
        await associatedClient.save();

        await Transaction.create({
          user: executionOrder.user,
          type: "refund",
          amount: executionOrder.amount,
          status: "successful",
          reference: `HTS-RFD-${Date.now()}`,
          description: `Reversal refund: Cancelled execution on order reference code: ${executionOrder._id}`,
          paymentMethod: "wallet"
        });
      }
    }

    executionOrder.status = status;
    await executionOrder.save();

    return res.status(200).json({
      success: true,
      message: `Order workflow status successfully transitioned to: '${status}'.`,
      order: executionOrder
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ORDER MATRIX: FETCH ALL SYSTEM ORDERS (ADMIN ONLY)
   ========================================================== */
export const getOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({})
      .populate("user", "name email")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: allOrders.length,
      orders: allOrders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ORDER MATRIX: REMOVE/DELETE ORDER REFERENCE (ADMIN ONLY)
   ========================================================== */
export const deleteOrder = async (req, res) => {
  try {
    const targetOrder = await Order.findById(req.params.id);
    if (!targetOrder) {
      return res.status(404).json({ success: false, message: "Target order parameter reference not found." });
    }

    await targetOrder.deleteOne();
    return res.status(200).json({ success: true, message: "Order records systematically purged." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
