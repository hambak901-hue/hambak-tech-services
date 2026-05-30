import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Imported directly to compare passwords without crashing

// Helper method to sign JSON Web Tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hambak_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user profile
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required inputs"
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedUsername = username.toLowerCase().trim();

    const userExists = await User.findOne({ 
      $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }] 
    });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email or Username already registered in system'
      });
    }

    const user = await User.create({
      name,
      username: sanitizedUsername,
      email: sanitizedEmail,
      phone,
      password,
      role: 'user', 
      wallet: 0.00  
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "Registration successful",
        token: generateToken(user._id),
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
    } else {
      res.status(400).json({ success: false, message: 'Invalid registration parameters sent.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate client & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password details"
      });
    }

    // Look up user profile directly from your Atlas cluster
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }

    // DIRECT COMPARISON GATEWAY: Bypasses user.matchPassword function bugs entirely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently suspended"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
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
    next(error);
  }
};

// @desc    Get current logged-in user profile parameters
// @route   GET /api/auth/me
// @access  Private
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select("-password");

    if (user) {
      res.status(200).json({
        success: true,
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
    } else {
      res.status(404).json({ success: false, message: 'Profile data mismatch in cluster.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout account session matrix
// @route   GET /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out cleanly from session matrices"
  });
};
