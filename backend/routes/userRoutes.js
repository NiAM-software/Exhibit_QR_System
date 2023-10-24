import express from 'express';
import {
  getExhibitForUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/exhibit/:id').get(getExhibitForUser);
export default router;