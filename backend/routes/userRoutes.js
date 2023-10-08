import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  forgotPassword, 
  resetPassword
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(registerUser)
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);
export default router;