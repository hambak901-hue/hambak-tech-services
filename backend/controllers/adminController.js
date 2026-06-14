import User from "../models/userModel.js";
import Order from "../models/order.js";
import Transaction from "../models/transaction.js";
import Service from "../models/service.js";

/* ==========================================================
   ADMIN ENGINE: FETCH SYSTEM METRICS & DASHBOARD STATS
   ========================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsersCount = await User.countDocuments({ role: { $ne: "admin" } });
    const totalOrdersCount = await Order.countDocuments();
    const totalServicesCount = await Service.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ status: "pending" });

    const financialStats = await Transaction.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: "$type", totalVolume: { $sum: "$amount" } } }
    ]);

    const monetaryMatrix = { deposits: 0, vtu: 0, printing: 0, nin: 0, service_payments: 0 };
    financialStats.forEach(stat => {
      if (monetaryMatrix.hasOwnProperty(stat._id)) {
        monetaryMatrix[stat._id] = stat.totalVolume;
      }
    });

    return res.status(200).json({
      success: true,
      metrics: {
        users: totalUsersCount,
        orders: totalOrdersCount,
        services: totalServicesCount,
        pendingOrders: pendingOrdersCount,
        revenue: monetaryMatrix
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ADMIN ENGINE: GET ALL REGISTERED CLIENT USERS
   ========================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const clients = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ADMIN ENGINE: MANUALLY FUND USER WALLET
   ========================================================== */
export const fundUserWallet = async (req, res) => {
  try {
    // Structural Fallback Matrix: captures 'userId', 'id', or 'user' payload maps seamlessly
    const targetUserId = req.body.userId || req.body.id || req.body.user;
    const amount = req.body.amount;

    if (!targetUserId || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid allocation parameters or amount specified." });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Target profile node not found in system storage." });
    }

    // Adjust balance parameters safely using numeric mutation vectors
    user.wallet = (Number(user.wallet) || 0) + Number(amount);
    await user.save();

    // Create an audit transaction record with fallback attributes to pass validation restrictions
    await Transaction.create({
      user: user._id, // References the verified MongoDB ObjectId directly from the user node
      type: "deposits",
      amount: Number(amount),
      status: "successful",
      description: "Admin manual wallet allocation adjustment",
      reference: "ADM-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    return res.status(200).json({
      success: true,
      message: `Successfully allocated ₦${Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2})} to ${user.name}'s account ledger.`
    });
  } catch (error) {
    console.error("Wallet funding cluster crash error:", error);
    return res.status(500).json({ success: false, message: "Transaction database validation failed: " + error.message });
  }
};

/* ==========================================================
   ADMIN ENGINE: TOGGLE ACCESS LOCKOUT (BLOCK/RESTRICT USER)
   ========================================================== */
export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User account records missing." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Administrative clusters cannot be blocked." });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account authorization set to: ${user.isBlocked ? 'Restricted' : 'Active'}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   ADMIN ENGINE: TERMINATE / DELETE USER ACCOUNT
   ========================================================== */
export const deleteUser = async (req, res) => {
  try {
    const userToDrop = await User.findById(req.params.id);
    if (!userToDrop) return res.status(404).json({ success: false, message: "Account not found." });
    if (userToDrop.role === "admin") return res.status(403).json({ success: false, message: "Cannot drop admin channels." });

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "User purged successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
