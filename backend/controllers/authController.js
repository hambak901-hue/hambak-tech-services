import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js"; // FIXED: Added your email utility import here

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

/* ==========================================================
   AUTHENTICATION MODULE: FORGOT PASSWORD (GENERATES OTP)
   ========================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email parameters require validation input." });
    }

    // Find user matching normalized lowercase identifier strings
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No registered context matching this identifier." });
    }

    // 1. Generate a premium 4-digit numeric code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Map verification properties onto your existing database User profile scheme
    user.resetPasswordToken = verificationCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Code window valid for 10 minutes
    await user.save();

    // 3. Premium Brand Interface Layout structure (Blue, Gold, Peach, Pink)
    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #ffdfd3; border-radius: 24px; padding: 35px; background-color: #081120; color: #ffffff; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h2 style="color: #f5b942; margin-top: 0; font-size: 1.6rem; letter-spacing: 1px; border-bottom: 1px solid rgba(255,223,211,0.1); padding-bottom: 15px;">HAMBAK TECH & SERVICES</h2>
        <p style="font-size: 1.05rem; line-height: 1.6; color: #cbd5e1; margin: 25px 0;">You requested a secure verification code to reset your profile password. Use the unique authentication token sequence below:</p>
        <div style="margin: 35px 0;">
          <span style="font-size: 2.4rem; font-weight: 800; letter-spacing: 8px; color: #ff4081; background-color: #ffffff; padding: 12px 30px; border-radius: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(255,64,129,0.2); border: 1px solid #ffdfd3;">${verificationCode}</span>
        </div>
        <p style="font-size: 0.85rem; color: #ffdfd3; opacity: 0.8; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this verification loop, please ignore this email safely.</p>
      </div>
    `;

    // 4. Fire email packet through your verified Gmail Nodemailer server transporter
    try {
      await sendEmail({
        email: user.email,
        subject: "Security Verification Code — Access Reset Link",
        html: htmlTemplate,
      });

      return res.status(200).json({
        success: true,
        message: "Security token generated and dispatched successfully. Check inbox folders."
      });

    } catch (emailError) {
      // Emergency rollback code clean if SMTP breaks
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error("Mail server error:", emailError);
      return res.status(500).json({ success: false, message: "Email dispatch failed. Service transport configurations offline." });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   AUTHENTICATION MODULE: VERIFY TOKEN CODE (VALIDATES OTP)
   ========================================================== */
export const verifyToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ success: false, message: "Email and token sequence keys required." });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() } // Assures token has not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification code or security window expired." });
    }

    // Success response if code matches
    return res.status(200).json({
      success: true,
      message: "Token credentials clear. Verification sequence complete."
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
        
