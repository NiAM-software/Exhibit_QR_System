import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  forgotPassword, 
  resetPassword
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/register').post(registerUser)
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);

export default router;