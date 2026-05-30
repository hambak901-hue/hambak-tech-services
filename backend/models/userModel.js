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
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Ecosystem mobile contact matrix required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Secure password string required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  wallet: {
    type: Number,
    default: 0.00
  },
  isBlocked: {
    type: Boolean,
    default: false
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

// MATCHING METHOD FOR LOGIN (Explicitly assigned directly to schema methods)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clear existing compiled models to force Mongoose to register our updated methods
if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);
export default User;

