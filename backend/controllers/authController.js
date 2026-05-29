import User from "../models/User.js";

/* =========================
REGISTER USER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required inputs"
      });
    }

    /* CHECK EXISTING USER IN SYSTEM */
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.toLowerCase().trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Username already registered in system"
      });
    }

    /* CREATE NEW ACCOUNT */
    const user = await User.create({
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone,
      password
    });

    /* GENERATE TOKEN FROM USER METHOD NATIVELY */
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
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
    console.error("Register Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
LOGIN USER
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password details"
      });
    }

    /* SEARCH PROFILE BY EMAIL */
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    /* CHECK ENCRYPTED PASSWORDS MATCH */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently suspended"
      });
    }

    /* GENERATE TOKEN */
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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
    console.error("Login Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET CURRENT ACCOUNT MATRIX
========================= */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
LOGOUT ACCOUNT
========================= */
export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out cleanly from session matrices"
  });
};
