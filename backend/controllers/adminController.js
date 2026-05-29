import User from "../models/User.js";
import Service from "../models/Service.js";
import Transaction from "../models/Transaction.js";

/* =========================
ADMIN DASHBOARD METRICS AGGREGATION
========================= */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalStudents = await User.countDocuments({ role: "student" });

    /* CALCULATE REVENUE FROM COMPLETED TRANSACTIONS LOGS NATIVELY */
    const revenueAggregation = await Transaction.aggregate([
      { $match: { status: "successful", type: { $in: ["payment", "service_payment", "vtu", "pos"] } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);

    const revenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalAmount : 0;

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    const recentServices = await Service.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalServices,
        totalAdmins,
        totalStudents,
        revenue
      },
      recentUsers,
      recentServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET ALL REGISTERED USERS SYSTEM-WIDE
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
DELETE USER DIRECT ROUTE
========================= */
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(400).json({ success: false, message: "Safety Block: Cannot delete administrative accounts via control panels" });
    }

    await userToDelete.deleteOne();
    res.status(200).json({ success: true, message: "User profile removed cleanly" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
