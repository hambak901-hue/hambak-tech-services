import Order from "../models/Order.js";
import Service from "../models/Service.js";
import User from "../models/userModel.js";
import Transaction from "../models/Transaction.js";

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

    // 1. Double check financial liquidity limits inside user balance profiles
    const customerProfile = await User.findById(clientAccountID);
    if (customerProfile.wallet < computedTotalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Operation requires ₦${computedTotalCost.toLocaleString()}, but wallet balance holds ₦${customerProfile.wallet.toLocaleString()}.`
      });
    }

    // 2. Isolate file references uploaded via multer pipeline
    const documentAssetPath = req.file ? `/uploads/${req.file.filename}` : "";

    // 3. Process the ledger balance deduction atomically
    customerProfile.wallet -= computedTotalCost;
    await customerProfile.save();

    const orderReferenceCode = `HTS-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Record transactional history entry footprint
    await Transaction.create({
      user: clientAccountID,
      type: "service_payment",
      amount: computedTotalCost,
      status: "successful",
      reference: orderReferenceCode,
      description: `Payment for ${orderQuantity}x ${serviceAsset.name} (${serviceAsset.category})`,
      paymentMethod: "wallet"
    });

    // 5. Generate and queue standard tracking orders inside database logs
    const serviceOrder = await Order.create({
      user: clientAccountID,
      customerName: customerName || customerProfile.name,
      customerEmail: customerEmail || customerProfile.email,
      customerPhone: customerPhone || customerProfile.phone,
      service: serviceId,
      quantity: orderQuantity,
      amount: computedTotalCost,
      message: message || "Standard automated operations request sequence.",
      file: documentAssetPath,
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

    // Strategic fallback rule: If order is explicitly cancelled, return locked funds back into profile ledger
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
