import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
USER SCHEMA
========================= */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "student", "admin"],
    default: "user"
  },
  avatar: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  wallet: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

/* =========================
HASH PASSWORD BEFORE SAVING
========================= */
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* =========================
COMPARE ENCRYPTED PASSWORDS
========================= */
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/* =========================
GENERATE SECURE AUTH TOKEN
========================= */
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
