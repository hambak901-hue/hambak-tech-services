// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM VTU & BULK DISTRIBUTION ROUTER Engine
// ==========================================================================

const express = require('express');
const router = express.Router();
// Assuming you have an authentication middleware to secure transactions
const { protect } = require('../middleware/authMiddleware'); 
const User = require('../models/User'); // Base User Schema to verify wallet details
const Order = require('../models/Order'); // Order Schema to track events

// ==========================================================================
// CENTRALIZED DISPATCH CONFIGURATION MATRIX (PRICING INDEX SYSTEM)
// ==========================================================================
// This blueprint maps costs dynamically based on the account security layer.
const PRICING_MATRIX = {
  airtime: {
    retailer: 0.98,   // 2% Discount
    wholesaler: 0.97, // 3% Discount
    subdealer: 0.96,  // 4% Discount
    dealer: 0.95     // 5% Premium Discount
  },
  data_1gb: {
    retailer: 250,
    wholesaler: 235,
    subdealer: 225,
    dealer: 215
  }
};

/**
 * @route   POST /api/vtu/airtime
 * @desc    Executes instant airtime dispatch matching account classification layers
 * @access  Private
 */
router.post('/airtime', protect, async (req, res) => {
  try {
    const { network, phoneNumber, amount } = req.body;
    const userId = req.user.id; 

    if (!network || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: "Missing system validation properties." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Ecosystem identity record not found." });
    }

    // Capture user layer or default to baseline retail pricing
    const userTier = user.tier || 'retailer';
    const discountFactor = PRICING_MATRIX.airtime[userTier] || PRICING_MATRIX.airtime.retailer;
    const totalSystemCharge = Number(amount) * discountFactor;

    if (user.walletBalance < totalSystemCharge) {
      return res.status(400).json({ success: false, message: "Insufficient ledger capital balance to process action." });
    }

    // Deduct calculated ledger value from wallet asset memory
    user.walletBalance -= totalSystemCharge;
    await user.save();

    // =============== UPSTREAM INTERFACE GATEWAY HOOK ===============
    // This is where you connect your external VTU API (e.g., Clubkonnect, VTpass, etc.)
    // ================================================================
    const upstreamTransactionId = "HBK-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create tracking reference record inside your system core logs
    const newVtuOrder = await Order.create({
      userId,
      type: 'Airtime Dispatch',
      network,
      destination: phoneNumber,
      valueMetric: `₦${amount}`,
      systemCharge: totalSystemCharge,
      gatewayReference: upstreamTransactionId,
      status: 'Successful'
    });

    res.status(200).json({
      success: true,
      message: "Airtime automated dispatch transaction complete.",
      chargeDeducted: totalSystemCharge,
      newBalance: user.walletBalance,
      logToken: newVtuOrder
    });

  } catch (error) {
    console.error("VTU Airtime System Failure Trace Log:", error);
    res.status(500).json({ success: false, message: "Fatal infrastructure communication routing fault." });
  }
});

/**
 * @route   POST /api/vtu/bulk-wholesale
 * @desc    Handles deep bulk processing for E-pin generation blueprints vs cargo shipping allocations
 * @access  Private
 */
router.post('/bulk-wholesale', protect, async (req, res) => {
  try {
    const { network, denomination, quantity, deliveryMode, deliveryAddress, contactReceiver } = req.body;
    const userId = req.user.id;

    if (!network || !denomination || !quantity || !deliveryMode) {
      return res.status(400).json({ success: false, message: "Missing essential bulk payload markers." });
    }

    const user = await User.findById(userId);
    const rawCost = Number(denomination) * Number(quantity);
    
    // Apply specialized high-volume system tier scaling rules
    const userTier = user.tier || 'retailer';
    let wholesaleDiscount = 0.97; // Baseline 3% off bulk
    if (userTier === 'subdealer') wholesaleDiscount = 0.95; // 5%
    if (userTier === 'dealer') wholesaleDiscount = 0.94;    // 6%

    let totalBulkCharge = rawCost * wholesaleDiscount;
    let shippingCost = 0;

    // Apply delivery logistics cost metrics if the user requested a brick-and-mortar physical fulfillment route
    if (deliveryMode === 'physical') {
      if (!deliveryAddress) {
        return res.status(400).json({ success: false, message: "Physical orders require a delivery destination layout." });
      }
      shippingCost = 2500; // Baseline dispatch matrix cost inside operations framework
      totalBulkCharge += shippingCost;
    }

    if (user.walletBalance < totalBulkCharge) {
      return res.status(400).json({ success: false, message: "Insufficient balance for bulk procurement deployment." });
    }

    // Commit balance allocation deductions
    user.walletBalance -= totalBulkCharge;
    await user.save();

    let orderStatus = deliveryMode === 'physical' ? 'Pending Processing' : 'Successful';
    let generatedEPins = [];

    // If it's a completely digital order, generate secure tokens instantly for down-stream rendering
    if (deliveryMode === 'digital') {
      for (let i = 0; i < Number(quantity); i++) {
        let pinBlock = Math.floor(100000000000 + Math.random() * 900000000000); // 12-digit mock code block array
        let serialBlock = "HBK-" + Math.floor(100000 + Math.random() * 900000);
        generatedEPins.push({ pin: pinBlock, serial: serialBlock });
      }
    }

    // Persist event state record to tracking log database ledger
    const wholesaleOrderLog = await Order.create({
      userId,
      type: deliveryMode === 'physical' ? 'Bulk Cargo Order' : 'E-Pin Dispatch',
      network: `${network} (${quantity} Pcs)`,
      valueMetric: `₦${rawCost.toLocaleString()}`,
      systemCharge: totalBulkCharge,
      deliveryMode,
      logisticsDetails: deliveryMode === 'physical' ? { deliveryAddress, contactReceiver, shippingCost } : null,
      status: orderStatus
    });

    res.status(200).json({
      success: true,
      message: deliveryMode === 'physical' 
        ? "Bulk physical order queued for physical warehouse delivery." 
        : "E-Pin batch generation trace processed successfully.",
      chargeDeducted: totalBulkCharge,
      newBalance: user.walletBalance,
      pins: generatedEPins.length > 0 ? generatedEPins : undefined,
      logToken: wholesaleOrderLog
    });

  } catch (error) {
    console.error("Bulk Wholesale System Error Trace:", error);
    res.status(500).json({ success: false, message: "Fatal transaction runtime exception inside distribution engine." });
  }
});

module.exports = router;
