import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // FIXED: Points to the unified user model file path

/* ==========================================================
   PROTECT ROUTES MIDDLEWARE (JWT Verification Gate)
   ========================================================== */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Missing authentication token parameters."
      });
    }

    /* VERIFY TOKEN SECURELY */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ATTACH COMPREHENSIVE USER CONTEXT TO REQUEST LIFECYCLE */
    req.user = await User.findById(decoded.id || decoded._id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Session Invalidated: Active account holder record not found."
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Access Restricted: This account has been suspended by management."
      });
    }

    next();
  } catch (error) {
    console.error("Auth Guard Error Matrix:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session Expired: Security authentication signature invalid."
    });
  }
};

/* ==========================================================
   ROLE ACCESS GUARDS
   ========================================================== */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Administrative Clearance Privilege Required."
    });
  }
};

export const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Specialized Student Account Clearance Required."
    });
  }
};
