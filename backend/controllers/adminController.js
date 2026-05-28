import User from "../models/User.js";
import Service from "../models/Service.js";

/* =========================
ADMIN DASHBOARD STATS
========================= */

export const getDashboardStats =
  async (req, res) => {
    
    try {
      
      /* TOTAL USERS */
      
      const totalUsers =
        await User.countDocuments();
      
      /* TOTAL SERVICES */
      
      const totalServices =
        await Service.countDocuments();
      
      /* TOTAL ADMINS */
      
      const totalAdmins =
        await User.countDocuments({
          role: "admin"
        });
      
      /* TOTAL STUDENTS */
      
      const totalStudents =
        await User.countDocuments({
          role: "student"
        });
      
      /* RECENT USERS */
      
      const recentUsers =
        await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password");
      
      /* RECENT SERVICES */
      
      const recentServices =
        await Service.find()
        .sort({ createdAt: -1 })
        .limit(5);
      
      /* PLACEHOLDER REVENUE */
      
      const revenue = 0;
      
      /* RESPONSE */
      
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