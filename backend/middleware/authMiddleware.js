import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =========================
PROTECT ROUTES MIDDLEWARE
========================= */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    /* VERIFY TOKEN Safely */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ATTACH USER MATRIX TO ROUTE */
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists"
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended by management"
      });
    }

    next();
  } catch (error) {
    console.error("Auth Guard Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authorization expired or signature invalid"
    });
  }
};

/* =========================
ROLE ACCESS GUARDS
========================= */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Administrative Clearance Required"
    });
  }
};

export const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Student Account Clearance Required"
    });
  }
};
