import express from 'express';
// FIXED: Added forgotPassword and verifyToken to the controller imports list
import { 
  registerUser, 
  loginUser, 
  getMyProfile, 
  logoutUser,
  forgotPassword,
  verifyToken
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMyProfile);
router.get('/logout', logoutUser);

// FIXED: Added endpoints to map frontend token requests securely
router.post('/forgot-password', forgotPassword);
router.post('/verify-token', verifyToken);

export default router;
