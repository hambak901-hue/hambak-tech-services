// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM VTU & BULK DISTRIBUTION ROUTER ENGINE
// ==========================================================================

import express from 'express';
const router = express.Router();

// Assuming you have an authentication middleware to secure transactions
// import { protect } from '../middleware/authMiddleware.js'; 

import User from '../models/userModel.js'; 
import Order from '../models/order.js'; 

// ==========================================================================
// CENTRALIZED DISPATCH CONFIGURATION MATRIX (PRICING INDEX SYSTEM)
// ==========================================================================
const PRICING_MATRIX = {
  airtime: {
    retailer: 0.98,   // 2% Discount
    wholesaler: 0.97, // 3% Discount
    subdealer: 0.96,  // 4% Discount
    dealer: 0.95      // 5% Premium Discount
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
// If you use authentication middleware, add 'protect' back inside: router.post('/airtime', protect, async ...
router.post('/airtime', async (req, res) => {
  try {
    const { network, phoneNumber, amount, userId } = req.body; 

    if (!network || !phoneNumber || !amount || !userId) {
      return res.status(400).json({ success: false, message: "Missing system validation properties." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Ecosystem identity record not found." });
    }

    const userTier = user.tier || 'retailer';
    const discountFactor = PRICING_MATRIX.airtime[userTier] || PRICING_MATRIX.airtime.retailer;
    const totalSystemCharge = Number(amount) * discountFactor;

    if (user.walletBalance < totalSystemCharge) {
      return res.status(400).json({ success: false, message: "Insufficient ledger capital balance." });
    }

    user.walletBalance -= totalSystemCharge;
    await user.save();

    const upstreamTransactionId = "HBK-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newVtuOrder = await Order.create({
      user: userId,
      isVtuOrder: true,
      type: 'Airtime Dispatch',
      network,
      destination: phoneNumber,
      amount: Number(amount),
      status: 'Successful',
      gatewayReference: upstreamTransactionId
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
    res.status(500).json({ success: false, message: "Fatal infrastructure communication fault." });
  }
});

/**
 * @route   POST /api/vtu/bulk-wholesale
 * @desc    Handles deep bulk processing for E-pin generation blueprints vs cargo shipping allocations
 * @access  Private
 */
router.post('/bulk-wholesale', async (req, res) => {
  try {
    const { network, denomination, quantity, deliveryMode, deliveryAddress, contactReceiver, userId } = req.body;

    if (!network || !denomination || !quantity || !deliveryMode || !userId) {
      return res.status(400).json({ success: false, message: "Missing essential bulk payload markers." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const rawCost = Number(denomination) * Number(quantity);
    const userTier = user.tier || 'retailer';
    
    let wholesaleDiscount = 0.97; 
    if (userTier === 'subdealer') wholesaleDiscount = 0.95; 
    if (userTier === 'dealer') wholesaleDiscount = 0.94;    

    let totalBulkCharge = rawCost * wholesaleDiscount;
    let shippingCost = 0;

    if (deliveryMode === 'physical') {
      if (!deliveryAddress) {
        return res.status(400).json({ success: false, message: "Physical orders require a delivery destination." });
      }
      shippingCost = 2500; 
      totalBulkCharge += shippingCost;
    }

    if (user.walletBalance < totalBulkCharge) {
      return res.status(400).json({ success: false, message: "Insufficient balance for bulk procurement." });
    }

    user.walletBalance -= totalBulkCharge;
    await user.save();

    let orderStatus = deliveryMode === 'physical' ? 'Pending Processing' : 'Successful';
    let generatedEPins = [];

    if (deliveryMode === 'digital') {
      for (let i = 0; i < Number(quantity); i++) {
        let pinBlock = Math.floor(100000000000 + Math.random() * 900000000000).toString(); 
        let serialBlock = "HBK-" + Math.floor(100000 + Math.random() * 900000).toString();
        generatedEPins.push({ pin: pinBlock, serial: serialBlock });
      }
    }

    const wholesaleOrderLog = await Order.create({
      user: userId,
      isVtuOrder: true,
      type: deliveryMode === 'physical' ? 'Bulk Cargo Order' : 'E-Pin Dispatch',
      network: `${network} (${quantity} Pcs)`,
      amount: rawCost,
      deliveryMode,
      logisticsDetails: deliveryMode === 'physical' ? { deliveryAddress, contactReceiver, shippingCost } : null,
      status: orderStatus,
      generatedPins: generatedEPins
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

export default router;
