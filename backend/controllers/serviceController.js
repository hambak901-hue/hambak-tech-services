import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/* =========================
CREATE TRANSACTION / EXECUTE FINANCIAL MATRIX
========================= */
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, paymentMethod } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ success: false, message: "Amount and transactional type tracking required" });
    }

    const userProfile = await User.findById(req.user.id);
    
    /* OVERDRAFT GUARD PROTECTION ROUTINE */
    if ((type === "withdrawal" || type === "service_payment" || type === "vtu") && userProfile.wallet < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance to perform operation"
      });
    }

    const reference = `HTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: Number(amount),
      description: description || `${type} processing record`,
      paymentMethod: paymentMethod || "wallet",
      reference,
      status: "successful"
    });

    /* UPDATE BALANCES DYNAMICALLY IN DB */
    if (type === "wallet_funding" || type === "deposit" || type === "refund") {
      await User.findByIdAndUpdate(req.user.id, { $inc: { wallet: Number(amount) } });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $inc: { wallet: -Number(amount) } });
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
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
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
