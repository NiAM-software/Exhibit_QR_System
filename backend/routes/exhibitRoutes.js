import express from 'express';
import {upload, getPresignedUrl} from '../utils/uploadFile.js';
import {iventoryDBConnection as db} from '../config/db.js'
import {
    getExhibitById,
    getExhibits, 
    createExhibit,
    deleteExhibits,
    undoDeleteExhibits,
    updateExhibit,
    uploadFilestoS3, 
    generatePreSignedUrl, 
    addRelatedExhibits
} from '../controllers/exhibitController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();
router.put('/undo-delete', protect, undoDeleteExhibits)
router.put('/:id', protect, updateExhibit)
router.get('/', protect, getExhibits)
router.post('/', protect, createExhibit)
router.get('/:id', protect, getExhibitById); // when ure redirected to edit product screen
router.delete('/', protect, deleteExhibits)

router.post('/generate-presigned-url', protect, generatePreSignedUrl)

//upload images to s3
router.post('/upload/:exhibit_id', protect, upload.array('photos', 25), async function (req, res, next) {
    const {exhibit_id} = req.params
    for (const file of req.files) {
        const name = file.key;
        const folderName = `exhibit_${req.params.exhibit_id}`;
        const fileName = name.split("/")[1];
        console.log(folderName + " " + fileName);

        try {
            const query = 'INSERT INTO attachments (exhibit_id, file_name, file_location) VALUES (?, ?, ?)';
            const [results, fields] = await db.promise().query(query, [exhibit_id, fileName, folderName]);

            if (results && results.affectedRows > 0) {
                console.log('Exhibit attachment created successfully');
            } else {
                return res.status(401).json({ message: "Failed to create exhibit attachment" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    res.status(201).json({ message: 'All exhibit attachments created successfully' });
    
});

router.post('/add-related-exhibits/:id', addRelatedExhibits)
export default router;