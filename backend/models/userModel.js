import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your official full name'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Please allocate a unique ecosystem username'],
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email authentication parameter required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address structure']
  },
  phone: {
    type: String,
    required: [true, 'Ecosystem mobile contact matrix required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Secure password string required'],
    minlength: [6, 'Password security constraint must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  wallet: {
    type: Number,
    default: 0.00,
    min: [0, 'Wallet balance parameters cannot drop below zero threshold rules']
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// PASSWORD HASHING MIDDLEWARE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// MATCHING METHOD FOR LOGIN
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// SAFE COMPILATION MATRIX: Prevents OverwriteModelErrors
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
