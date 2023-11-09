import express from 'express';
import {
  getExhibitForUser,
  getRelatedExhibits
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/exhibit/:id').get(getExhibitForUser);
router.get('/related-exhibits/:id', getRelatedExhibits)
export default router;