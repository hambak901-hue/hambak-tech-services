import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMyProfile, 
  logoutUser,
  forgotPassword,
  verifyToken,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMyProfile);
router.get('/logout', logoutUser);

// Password recovery pipeline channels
router.post('/forgot-password', forgotPassword);
router.post('/verify-token', verifyToken);
router.post('/reset-password', resetPassword);

export default router;
