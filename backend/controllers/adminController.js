import User from "../models/user.js";
import Order from "../models/order.js";
import Transaction from "../models/transaction.js";
import Service from "../models/service.js";

/* ==========================================================
   ADMIN ENGINE: FETCH SYSTEM METRICS & DASHBOARD STATS
   ========================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Gather baseline volume counts across collections
    const totalUsersCount = await User.countDocuments({ role: { $ne: "admin" } });
    const totalOrdersCount = await Order.countDocuments();
    const totalServicesCount = await Service.countDocuments();

    // 2. Fetch specific breakdown metrics
    const pendingOrdersCount = await Order.countDocuments({ status: "pending" });
    const completedOrdersCount = await Order.countDocuments({ status: "completed" });

    // 3. Aggregate all financial variables processed via wallet deposits
    const financialStats = await Transaction.aggregate([
      { $match: { status: "successful" } },
      {
        $group: {
          _id: "$type",
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);

    // Format financial stats into a clean key-value object map
    const monetaryMatrix = {
      deposits: 0,
      vtu: 0,
      printing: 0,
      nin: 0,
      service_payments: 0
    };

    financialStats.forEach(stat => {
      if (monetaryMatrix.hasOwnProperty(stat._id)) {
        monetaryMatrix[stat._id] = stat.totalVolume;
      }
    });

    // 4. Extract recent logs to display on the dashboard feed
    const recentTransactions = await Transaction.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate("service", "name category")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      metrics: {
        users: totalUsersCount,
        orders: totalOrdersCount,
        services: totalServicesCount,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
        revenue: monetaryMatrix
      },
      recentActivity: {
        transactions: recentTransactions,
        orders: recentOrders
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to compile administrative matrix data: ${error.message}`
    });
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

    return res.status(200).json({
      success: true,
      count: clients.length,
      users: clients
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

    if (!userToDrop) {
      return res.status(404).json({ success: false, message: "Target account data not located." });
    }

    if (userToDrop.role === "admin") {
      return res.status(403).json({ success: false, message: "Security Guard: Administrative profiles cannot be dropped programmatically." });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User context purged from database cluster successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
