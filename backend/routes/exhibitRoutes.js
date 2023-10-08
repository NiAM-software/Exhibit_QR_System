import express from 'express';
import upload from '../utils/uploadFile.js';

import {
    getExhibitById,
    getExhibits, 
    createExhibit,
    deleteExhibit,
    updateExhibit,
    uploadFilestoS3
} from '../controllers/exhibitController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

console.log('exhibit router')
const router = express.Router();


router.get('/', getExhibits)
router.post('/', createExhibit)
router.get('/:id', getExhibitById); // when ure redirected to edit product screen
router.delete('/:id', deleteExhibit)
router.put('/:id', updateExhibit)
router.post('/upload', upload.array('photos', 3), uploadFilestoS3)


export default router;