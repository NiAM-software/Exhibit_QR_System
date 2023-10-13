import express from 'express';
import {upload, getPresignedUrl} from '../utils/uploadFile.js';
import {iventoryDBConnection as db} from '../config/db.js'
import {
    getExhibitById,
    getExhibits, 
    createExhibit,
    deleteExhibits,
    updateExhibit,
    uploadFilestoS3, 
    generatePreSignedUrl
} from '../controllers/exhibitController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();


router.get('/', getExhibits)
router.post('/', upload.array('photos', 25), createExhibit)
router.get('/:id', getExhibitById); // when ure redirected to edit product screen
router.delete('/', deleteExhibits)
router.put('/:id', updateExhibit)
router.post('/generate-presigned-url', generatePreSignedUrl)

router.post('/upload/:exhibit_id', upload.array('photos', 25), async function (req, res, next) {
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


export default router;