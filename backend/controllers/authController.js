import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Internal helper to mint tokens cleanly
const generateTokenIdSignature = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d"
  });
};

/* ==========================================================
   AUTHENTICATION MODULE: CLIENT REGISTRATION
   ========================================================== */
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All initialization parameters are required." });
    }

    // Check for unique database entry collisions
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    const usernameExists = await User.findOne({ username: username.toLowerCase() });

    if (emailExists || usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Registration halted: Email identifier or username token is already assigned."
      });
    }

    const newUser = await User.create({
      name,
      username,
      email,
      phone,
      password,
      wallet: 0.00 // Set structural wallet base defaults
    });

    return res.status(201).json({
      success: true,
      message: "Ecosystem account entry established successfully.",
      token: generateTokenIdSignature(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        wallet: newUser.wallet
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   AUTHENTICATION MODULE: SYSTEM USER LOGIN
   ========================================================== */
export const loginUser = async (req, res) => {
  try {
    const { loginIdentity, password } = req.body; // Allows logging in via email or username flexibly

    if (!loginIdentity || !password) {
      return res.status(400).json({ success: false, message: "Credentials payload tracking requires full identification parameters." });
    }

    // Dynamic relational lookup
    const user = await User.findOne({
      $or: [
        { email: loginIdentity.toLowerCase() },
        { username: loginIdentity.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials: Entry matches no recorded context." });
    }

    // Call unified matchPassword verification method
    const passMatches = await user.matchPassword(password);
    if (!passMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials: Secure string mismatch verified." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Authentication Denied: Profile access is suspended by management." });
    }

    return res.status(200).json({
      success: true,
      message: "Authentication cleared. Initializing user session context.",
      token: generateTokenIdSignature(user._id),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   AUTHENTICATION MODULE: GET CURRENT USER PROFILE
   ========================================================== */
export const getMyProfile = async (req, res) => {
  try {
    // req.user is loaded dynamically inside the protect middleware
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User context not found." });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   AUTHENTICATION MODULE: LOGOUT USER
   ========================================================== */
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Session terminated safely. User successfully logged out."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
