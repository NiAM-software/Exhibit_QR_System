import express from "express";
import { upload, getPresignedUrl } from "../utils/uploadFile.js";
import { iventoryDBConnection as db} from "../config/db.js";
import {
  getExhibitById,
  getDeletedExhibits,
  getExhibits,
  createExhibit,
  deleteExhibits,
  undoDeleteExhibits,
  updateExhibit,
  uploadFilestoS3,
  generatePreSignedUrl,
  addRelatedExhibits,
  previewImage,
  rollbackAttachment,
  getAttachments,
  getNextAssetNumber,
  getCategoriesAndLocationTypes,
  getExhibitsFiltered,
  getRelatedExhibits,
  modifiedRelatedExhibits,
  exportDataAsCSV
} from "../controllers/exhibitController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { deleteObjectsFromS3 } from "../utils/uploadFile.js";
import { 
  deleteAttachmentsUtils,
  deleteMultipleAttachmentsUtils
} from '../utils/attachmentUtils.js';
import queries from '../sql_queries/queries.js';
import drop_queries from '../sql_queries/drop_queries.js';
import rollBackInsert from '../controllers/rollBackController.js';
import {helperProcessData} from '../sql_queries/dataMassaging.js';
import multer from 'multer';
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, '../uploads/')
//   },
//   filename: function(req, file, cb) {
//     cb(null, 'data.csv')
//   }
// });

const localUpload = multer({ dest: 'uploads/' });

import {getMaintenanceList,
  createCategory,
  updateCategory,
  deleteCategory,
  // createLocation,
  // updateLocation,
  // deleteLocation,
  createLocationType,
  updateLocationType,
  deleteLocationType,
  createRoom,
  updateRoom,
   deleteRoom} from "../controllers/maintenanceController.js";


const router = express.Router();


router.post("/import-csv", localUpload.single("file"), async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) {
      console.error("Inventory DB Connection Failed", err);
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      // Start using the connection
      const file = req.file;
      if (!file) {
        connection.release();
        return res.status(400).json({ message: "No file uploaded" });
      }


      const result = await helperProcessData(file.path, req.file.originalname);
      const columnList = result.headers.map(header => `\`${header}\``).join(', ');
      const filePath = result.filePath;
      
      connection.beginTransaction();

      try {

        // Drop tables if they exist
        for (const query of drop_queries) {
              try {
                connection.execute(query);
          } catch (queryError) {
              // Log the error or handle it as needed
              console.error('Query execution failed:', queryError);
              throw queryError; 
          }
        }

        // Load CSV data into exhibits_dummy table
        const loadQuery = `
          LOAD DATA LOCAL INFILE '${filePath}'
          INTO TABLE exhibits_dummy 
          FIELDS OPTIONALLY ENCLOSED BY '"'
          TERMINATED BY ',' 
          LINES TERMINATED BY '\\n' 
          IGNORE 1 LINES
          (${columnList})
        `;

        //SET asset_number = NULLIF(@asset_number, '');
         connection.query(loadQuery); // Use `query` instead of `execute`

        // Execute other queries
        for (const query of queries) {
          try {
              connection.execute(query);
          } catch (queryError) {
              // Log the error or handle it as needed
              console.error('Query execution failed:', queryError);
              throw queryError; // Re-throw the error to trigger the catch block
          }
        }
        connection.commit();
        res.status(201).json({ message: 'All queries executed successfully in transaction' });
      
      } catch (error) {
         connection.rollback();
        console.error('Transaction failed:', error);
        res.status(500).json({ message: 'Transaction failed', error: error.message });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred', error: error.message });
  } finally {
      connection.release();
    }
  });
});


router.get("/export", exportDataAsCSV);

router.get("/next-asset-number", getNextAssetNumber);
router.get("/categories-and-location-types", getCategoriesAndLocationTypes);
router.get("/maintenance", getMaintenanceList);
router.post("/maintenance/category", createCategory);
router.put("/maintenance/category", updateCategory);
router.delete("/maintenance/category", protect, deleteCategory);
router.post("/maintenance/location_type", createLocationType);
router.put("/maintenance/location_type", updateLocationType);
router.delete("/maintenance/location_type", protect, deleteLocationType);
router.post("/maintenance/room", createRoom);
router.put("/maintenance/room", updateRoom);
router.delete("/maintenance/room", protect, deleteRoom);
router.post("/generate-presigned-url", protect, generatePreSignedUrl);

router.post(
  "/add-modified-files/:exhibit_id",
  upload.array("newFiles", 25),
  async function (req, res, next) {
    const { exhibit_id } = req.params;
    const filesToBeDeleted = JSON.parse(req.body.filesToBeDeleted);
    console.log("DELETED FILES");
    console.log(filesToBeDeleted);
  
    const deletedFilesResponse = await deleteObjectsFromS3(filesToBeDeleted);
    const deleteAttachmentsResponse = await deleteMultipleAttachmentsUtils(filesToBeDeleted)
    for (const file of req.files) {
      const name = file.key;
      const fileSize = file.size
      const fileType = file.mimetype.split("/")[0];
      const folderName = `exhibit_${req.params.exhibit_id}`;
      const fileName = name.split("/")[1];

      try {
        const query =
        "INSERT INTO attachments (exhibit_id, file_name, file_size, file_type, file_location) VALUES (?, ?,?, ?, ?)";
      const [results, fields] = await db
        .promise()
        .query(query, [exhibit_id, fileName,fileSize,fileType, folderName]);

        if (results && results.affectedRows > 0) {
        } else {
          // if adding an attachment fails -> throw an error
          return res
            .status(401)
            .json({ message: "Failed to create exhibit attachment" });
        }
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    }

    //  combined response
    res.status(201).json({
      insertedFilesResponse: "All exhibit attachments created successfully",
      deletedFilesResponse: deletedFilesResponse,
    });
  }
);
router.post('/add-modified-exhibits/:id', modifiedRelatedExhibits);
router.put("/undo-delete", protect, undoDeleteExhibits);
router.put("/:id", protect, updateExhibit);
router.get("/", protect, getExhibits);
router.get("/bin", protect, getDeletedExhibits);
router.post("/", protect, createExhibit);
router.get("/:id", protect, getExhibitById); // when ure redirected to edit product screen
router.delete("/", protect, deleteExhibits);


//upload images to s3
router.post(
  "/upload/:exhibit_id",
  protect,
  upload.array("photos", 25),
  async function (req, res, next) {
    const { exhibit_id } = req.params;
    
  
    for (const file of req.files) {
      console.log('HI'+file.size);
      const name = file.key;
      const fileSize = file.size
      const fileType = file.mimetype.split("/")[0];
      const folderName = `exhibit_${req.params.exhibit_id}`;
      const fileName = name.split("/")[1];

      try {
        const query =
          "INSERT INTO attachments (exhibit_id, file_name, file_size, file_type, file_location) VALUES (?, ?,?, ?, ?)";
        const [results, fields] = await db
          .promise()
          .query(query, [exhibit_id, fileName,fileSize,fileType, folderName]);

        if (results && results.affectedRows > 0) {
          console.log("Exhibit attachment created successfully");
        } else {
          return res
            .status(401)
            .json({ message: "Failed to create exhibit attachment" });
        }
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    }

    res
      .status(201)
      .json({ message: "All exhibit attachments created successfully" });
  }
);
router.get('/filtered/:id', getExhibitsFiltered)
router.get('/related-exhibits/:id', getRelatedExhibits)
router.post("/add-related-exhibits/:id", addRelatedExhibits);
router.get("/preview-image/:id", previewImage);
router.post("/rollback-attachment", rollbackAttachment);
router.get("/get-attachments/:exhibit_id", getAttachments);
router.delete("/rollback/:id", protect, rollBackInsert);

export default router;