// ==========================================================================
// HAMBAK TECH & SERVICES - SYSTEM VTU & BULK DISTRIBUTION ROUTER ENGINE
// ==========================================================================

import express from 'express';
const router = express.Router();
import User from '../models/userModel.js'; 
import Order from '../models/order.js'; 

// Centralized pricing discount arrays
const PRICING_MATRIX = {
  airtime: {
    user: 0.98,        // Standard Client rate (2% discount)
    subdealer: 0.96,   // Wholesaler tier (4% discount)
    admin: 0.95        // Manager tier (5% premium discount)
  },
  data_1gb: {
    user: 250,
    subdealer: 225,
    admin: 215
  }
};

/**
 * @route   POST /api/vtu/airtime
 * @desc    Executes instant airtime/data dispatch matching account tier classification
 */
router.post('/airtime', async (req, res) => {
  try {
    const { network, phoneNumber, amount, isData, dataPlan } = req.body; 

    // Retrieve userId safely from parsing headers or custom authentication payloads
    const userId = req.body.userId || req.headers['user-id']; 

    if (!network || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: "Missing system validation parameters." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Ecosystem user identity not found." });
    }

    // Align with userModel role tracking attributes safely
    const userRole = user.role || 'user';
    const discountFactor = PRICING_MATRIX.airtime[userRole] || PRICING_MATRIX.airtime.user;
    
    // Calculate charges based on transaction intent
    let totalSystemCharge = isData ? (PRICING_MATRIX.data_1gb[userRole] || 250) : (Number(amount) * discountFactor);

    if (user.wallet < totalSystemCharge) {
      return res.status(400).json({ success: false, message: "Insufficient ledger capital balance inside wallet." });
    }

    // Deduct directly from the exact schema field
    user.wallet -= totalSystemCharge;
    await user.save();

    const upstreamTransactionId = "HBK-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newVtuOrder = await Order.create({
      user: userId,
      isVtuOrder: true,
      type: isData ? `Data Allocation (${dataPlan})` : 'Airtime Dispatch',
      network,
      destination: phoneNumber,
      amount: Number(amount),
      status: 'Successful',
      gatewayReference: upstreamTransactionId
    });

    res.status(200).json({
      success: true,
      message: `${isData ? 'Data plan bundle' : 'Airtime'} transaction complete.`,
      chargeDeducted: totalSystemCharge,
      newBalance: user.wallet,
      logToken: newVtuOrder
    });

  } catch (error) {
    console.error("VTU Airtime System Failure Trace Log:", error);
    res.status(500).json({ success: false, message: "Fatal infrastructure communication fault." });
  }
});

/**
 * @route   POST /api/vtu/bulk-wholesale
 * @desc    Handles deep bulk processing for E-pin generation blueprints
 */
router.post('/bulk-wholesale', async (req, res) => {
  try {
    const { network, denomination, quantity, deliveryMode, deliveryAddress, contactReceiver } = req.body;
    const userId = req.body.userId || req.headers['user-id'];

    if (!network || !denomination || !quantity || !deliveryMode) {
      return res.status(400).json({ success: false, message: "Missing essential bulk payload markers." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const rawCost = Number(denomination) * Number(quantity);
    const userRole = user.role || 'user';
    
    let wholesaleDiscount = 0.97; 
    if (userRole === 'subdealer') wholesaleDiscount = 0.95; 
    if (userRole === 'admin') wholesaleDiscount = 0.94;    

    let totalBulkCharge = rawCost * wholesaleDiscount;
    let shippingCost = 0;

    if (deliveryMode === 'physical') {
      if (!deliveryAddress) {
        return res.status(400).json({ success: false, message: "Physical orders require a delivery destination." });
      }
      shippingCost = 2500; 
      totalBulkCharge += shippingCost;
    }

    if (user.wallet < totalBulkCharge) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance for wholesale procurement." });
    }

    user.wallet -= totalBulkCharge;
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
        ? "Bulk physical cargo configuration queued for fulfillment." 
        : "E-Pin batch generation trace processed successfully.",
      chargeDeducted: totalBulkCharge,
      newBalance: user.wallet,
      pins: generatedEPins.length > 0 ? generatedEPins : undefined,
      logToken: wholesaleOrderLog
    });

  } catch (error) {
    console.error("Bulk Wholesale System Error Trace:", error);
    res.status(500).json({ success: false, message: "Fatal transaction runtime exception inside engine." });
  }
});

export default router;
