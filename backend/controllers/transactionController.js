import Transaction from "../models/Transaction.js";
import User from "../models/userModel.js";

/* =========================
PAYSTACK MATRIX: INITIALIZE DEPOSIT
========================= */
export const initializePaystackDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Please provide a valid deposit amount." });
    }

    // Paystack processes currency inputs in Kobo values (Multiply by 100)
    const paystackAmount = Math.round(amount * 100); 
    const reference = `HTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Call Paystack Initialization APIs
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: paystackAmount,
        reference,
        callback_url: `${req.protocol}://${req.get("host")}/pages/dashboard.html`
      })
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ success: false, message: data.message || "Paystack initialization failed." });
    }

    // Register a baseline 'pending' record into your MongoDB Atlas cluster
    await Transaction.create({
      user: req.user._id || req.user.id,
      type: "wallet_funding",
      amount: Number(amount),
      reference,
      description: "Paystack online wallet funding session initial entry",
      paymentMethod: "card",
      status: "pending"
    });

    res.status(200).json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
PAYSTACK MATRIX: VERIFY DEPOSIT & FUND WALLET
========================= */
export const verifyPaystackDeposit = async (req, res, next) => {
  try {
    const { reference } = req.body;

    const existingTx = await Transaction.findOne({ reference });
    if (!existingTx) {
      return res.status(404).json({ success: false, message: "Transaction record not found in system." });
    }

    if (existingTx.status === "successful") {
      return res.status(200).json({ success: true, message: "Transaction already processed and funded." });
    }

    // Validate checkout payload tracking values directly via Paystack Engine
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      // Update data log parameters locally
      existingTx.status = "successful";
      await existingTx.save();

      // Locate user profile and credit wallet matrices cleanly
      const user = await User.findById(existingTx.user);
      if (user) {
        user.wallet += existingTx.amount;
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: "Wallet funded successfully through Paystack checkout channels.",
        newWalletBalance: user ? user.wallet : 0
      });
    } else {
      existingTx.status = "failed";
      await existingTx.save();
      return res.status(400).json({ success: false, message: "Payment confirmation processing was rejected by Paystack." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
CREATE MANUAL TRANSACTION / CORE ROUTINE
========================= */
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, paymentMethod } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ success: false, message: "Amount and transactional type tracking required" });
    }

    const userId = req.user._id || req.user.id;
    const userProfile = await User.findById(userId);
    
    /* OVERDRAFT GUARD PROTECTION ROUTINE */
    if ((type === "withdrawal" || type === "service_payment" || type === "vtu") && userProfile.wallet < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance to perform operation"
      });
    }

    const reference = `HTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount: Number(amount),
      description: description || `${type} processing record`,
      paymentMethod: paymentMethod || "wallet",
      reference,
      status: "successful"
    });

    /* UPDATE BALANCES DYNAMICALLY IN DB */
    if (type === "wallet_funding" || type === "deposit" || type === "refund") {
      await User.findByIdAndUpdate(userId, { $inc: { wallet: Number(amount) } });
    } else {
      await User.findByIdAndUpdate(userId, { $inc: { wallet: -Number(amount) } });
    }

    res.status(201).json({
      success: true,
      message: "Transaction logged and balance synchronized successfully",
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET CURRENT LOGGED IN USER LOGS
========================= */
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
ADMIN: MONITOR ALL SYSTEM TRANSFERS
========================= */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
