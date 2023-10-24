import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import AWS from 'aws-sdk';
import { 
  getPresignedUrl, 
  deleteObjectFromS3
} from '../utils/uploadFile.js'; // Import utility function
import s3 from '../config/s3_config.js'

import dotenv from 'dotenv';
dotenv.config();



// @desc    Fetch all exhibits
// @route   GET /api/exhibits
// @access  Private/Admin
const getExhibits = asyncHandler(async (req, res) => {
  console.log('exhibits info');
  const limit = Number(req.query.pageNumber);
  const pageSize = limit ? (limit < 100 ? limit : 100) : 20;
  const page = Number(req.query.page) || 1;
  //search func
  const keyword = req.query.keyword
  ? `WHERE title LIKE '%${req.query.keyword}%' AND active_ind='Y'`
  : 'WHERE active_ind="Y"';

  
  const countQuery = `SELECT COUNT(*) AS total FROM exhibits ${keyword}`;
  const exhibitsQuery = `SELECT * FROM exhibits ${keyword}`;

  try {
    const [countResults] = await db.promise().query(countQuery);
    const count = countResults[0].total; // total no of records 
    //console.log(count);

    // Fetch exhibits
    const [exhibitsResults] = await db.promise().query(exhibitsQuery);
    const exhibits = exhibitsResults;
    //console.log(exhibits.length);
    res.json({ exhibits, page, pages: Math.ceil(count / pageSize) }); 
  } catch (err) {
    console.error('Error fetching exhibits:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// @desc    Fetch single exhibit
// @route   GET /api/exhibits/:id
// @access  Private/Admin
const getExhibitById = asyncHandler(async (req, res) => {
  const {id} = req.params
 
  try {
    const query = "SELECT * FROM exhibits WHERE exhibit_id=? and active_ind='Y'";
    const [results, fields] = await db.promise().query(query, [id]);
    //console.log(results);
    if (results && results.length > 0) {
      res.status(200).json(results[0])
      
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})


// @desc    Create an exhibit
// @route   POST /api/exhibits
// @access  Private/Admin
const createExhibit = asyncHandler(async (req, res) => {
  const {
    title, 
    category, 
    subcategory, 
    room, 
    location_type, 
    location, 
    asset_number,
    era, 
    exhibit_desc
  } = req.body;
  console.log(req.files);
  const era_int = era === '' ? null : parseInt(era, 10);
  try {
    const query = 'INSERT INTO exhibits (title, category, subcategory, room, location_type, location, asset_number, era, exhibit_desc, active_ind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [results, fields] = await db.promise().query(query, [title, category, subcategory, room, location_type, location, asset_number, era_int, exhibit_desc,'Y']);

    if (results && results.affectedRows > 0) {
      const newExhibitId = results.insertId;

      console.log(newExhibitId);
      res.status(201).json({ message: 'Exhibit created successfully' , id : newExhibitId});
    } else {
      return res.status(401).json({ message: "Failed to create exhibit" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const updateExhibit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //"message": "Duplicate entry '1927--1920' for key 'exhibits.constraint_name'"
  try {
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id=? AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);

    if (selectResults && selectResults.length > 0) {
      const {
        title,
        category,
        subcategory,
        room,
        location_type,
        location,
        asset_number,
        era,
        exhibit_desc,
      } = req.body;
      
      const values = [
        title,
        category,
        subcategory,
        room,
        location_type,
        location,
        asset_number,
        era,
        exhibit_desc,
        id
      ];
      const updateQuery ="UPDATE exhibits SET title=?, category=?, subcategory=?, room=?, location_type=?, location=?, asset_number=?, era=?, exhibit_desc=? WHERE exhibit_id=? and active_ind='Y'";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, values);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully updated exhibit" }); // wrong status code for dev env
      } else {
        return res.status(500).json({ message: "Couldn't couldnt update exhibit" });
      }
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    Delete exhibit
// @route   DELETE /api/exhibits/:id
// @access  Private/Admin


const deleteExhibits = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  try { // UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id IN (?) AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted exhibits" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "No exhibits were deleted" });
      }
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    undo Delete exhibit
// @route   PUT /api/exhibits/:id
// @access  Private/Admin
const undoDeleteExhibits = asyncHandler(async (req, res) => {
  console.log("UNDO");
  const { ids } = req.body.data;
  
  try { // UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id IN (?) AND active_ind='N'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      console.log('undo delete rows');
      const updateQuery = "UPDATE exhibits SET active_ind='Y' WHERE exhibit_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        console.log('successful');
        return res.status(200).json({ message: "Successfully restored exhibits" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "Couldn't restore exhibits" });
      }
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//folder structure
const uploadFilestoS3 = asyncHandler(async (req, res) => {
  // try {
  //   console.log(req.files)
  //   if (!req.files) {
  //     return res.status(400).json({ error: 'No files were uploaded.' });
  //   }

  //   const query = 'INSERT INTO attachments (exhibit_id, file_name, file_location) VALUES (?, ?, ?)';
  //   const [results, fields] = await db.promise().query(query, [id, name,  location]);

  //   if (results && results.affectedRows > 0) {
  //     res.status(201).json({ message: 'Exhibit attachment created successfully' });
  //   } else {
  //     return res.status(401).json({ message: "Failed to create exhibit" });
  //   }
  //   // const {exhibit_id} = req.params;
  //   // const s3 = new AWS.S3();
  //   // const bucketName = process.env.S3_BUCKET; 
  //   // const folderName = `exhibit_id_${exhibit_id}`; 

  // }catch (err) {
  //   return res.status(500).json({ message: err.message });
  // }
});

const generatePreSignedUrl = async (req, res) => {

  try {
    const { objectKeys } = req.body;
    
    const bucketName = process.env.S3_BUCKET; 
   
    if (!Array.isArray(objectKeys)) {
      return res.status(400).json({ error: 'Invalid input. objectKeys should be an array.' });
    }

    const urls = await Promise.all(objectKeys.map(async (objectKey) => {
      const { folderName, fileName } = objectKey
      const path = `${folderName}/${fileName}`;
      try {
        
        //console.log(path);
        const url = await getPresignedUrl(s3, bucketName, path);
        return { folderName, fileName, url };
      } catch (error) {
        console.error(`Error generating presigned URL for ${path}`, error.message);
        return { folderName, fileName, error: error.message };
      }
    }));

    res.json({ urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// @desc    Add a related exhibit
// @route   POST /api/exhibits/add-related-exhibit
// @access  Private/Admin
const addRelatedExhibits = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { related_exhibits_ids } = req.body;
  const insertedRelationships = [];

  try {
    if (!Array.isArray(related_exhibits_ids)) {
      return res.status(400).json({ error: 'invalid input. exhibit_ids should be an array.' });
    }
    for (const relatedIdInfo of related_exhibits_ids) {
      const {
        related_exhibit_id, related_exhibit_title
      } = relatedIdInfo
      // console.log(relatedIdInfo);
      // console.log(related_exhibit_id + " " + related_exhibit_title);
      const checkExistenceQuery =
        "SELECT * FROM related_exhibits WHERE exhibit_id = ? AND related_exhibit_id = ?";
      const [existenceResults, existenceFields] = await db
        .promise()
        .query(checkExistenceQuery, [id, related_exhibit_id]);

      if (existenceResults && existenceResults.length === 0) {
        // insert a row if it doesn't already exist
        const insertRelationshipQuery =
          "INSERT INTO related_exhibits (exhibit_id, related_exhibit_id, related_exhibit_title) VALUES (?, ?, ?)";
        const [insertResult] = await db
          .promise()
          .query(insertRelationshipQuery, [id, related_exhibit_id, related_exhibit_title]);

        insertedRelationships.push(insertResult.insertId);
      }
    }

    return res.status(200).json({
      message: "Successfully inserted relationships",
      insertedRelationships,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    preview image of an exhibit
// @route   GET /api/exhibits/preview-image/:id
// @access  Private/Admin
const previewImage = asyncHandler(async (req, res) => {
  const {id} = req.params // exhibit_id
  console.log(id)
  try {
    const query = "SELECT * FROM attachments WHERE exhibit_id=? limit 1"; 
    const [results, fields] = await db.promise().query(query, [id]);
    
    if (results && results.length > 0) {
      const {file_location:folderName, file_name} = results[0]
      const path = `${folderName}/${file_name}`;
      const bucketName = process.env.S3_BUCKET; 
      const url = await getPresignedUrl(s3, bucketName, path);
      return res.status(200).json({ folderName, file_name, url });
      
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})

const rollbackAttachment = asyncHandler(async (req, res) => {
  const { fileName, folderName } = req.body;

  try {
    const query = "DELETE FROM attachments WHERE file_name=? AND file_location=?";
    const [results, fields] = await db.promise().query(query, [fileName, folderName]);
    console.log(results);
    if (results && results.affectedRows > 0) {
      return res.status(200).json({ folderName });
    } else {
      return res.status(404).json({ message: "Resource doesn;t exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const deleteObjectsFromS3 = async (req, res) => {
  try {
    const { objectKeys } = req.body;

    if (!Array.isArray(objectKeys)) {
      return res.status(400).json({ error: 'Invalid input. objectKeys should be an array.' });
    }

    const bucket = process.env.S3_BUCKET;

    // Delete each object in parallel
    await Promise.all(objectKeys.map(async (objectKey) => {
      const { folderName, fileName } = objectKey;
      const key = fileName.length > 0 ? `${folderName}/${fileName}` : folderName;
      console.log(key);
      await deleteObjectFromS3(bucket, key);
    }));

    return res.status(200).json('All objects deleted successfully.');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// @desc    Fetch all attachments file locations
// @route   GET /api/exhibits/:id
// @access  Private/Admin
const getAttachments = asyncHandler(async (req, res) => {
  const {exhibit_id} = req.params
  
  try {
    const query = "SELECT * FROM attachments WHERE exhibit_id=?";
    const [results, fields] = await db.promise().query(query, [exhibit_id]);
    //console.log(results);
    if (results && results.length > 0) {
      res.status(200).json(results)
      
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})


const getNextAssetNumber = asyncHandler(async (req, res) => {
  res.send('asset numner ')
  const {exhibit_id} = req.params
  
  try {
    const query = "SELECT MAX(asset_number) FROM exhibits";
    const [results, fields] = await db.promise().query(query, [exhibit_id]);
    console.log(results);
    if (results && results.length > 0) {
      res.status(200).json(results)
      
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})

// @desc    Fetch all unique and non empty categories
// @route   GET /api/admin/exhibits/categories
// @access  Private/Admin
const getCategoriesAndLocationTypes = async (req, res) => {
  try {
    const categoriesQuery = 'SELECT DISTINCT category FROM exhibits';
    const locationTypesQuery = 'SELECT DISTINCT location_type FROM exhibits';

    const [categoriesResults, locationTypesResults] = await Promise.all([
      db.promise().query(categoriesQuery),
      db.promise().query(locationTypesQuery),
    ]);

    if (categoriesResults[0] && categoriesResults[0].length > 0 && locationTypesResults[0] && locationTypesResults[0].length > 0) {
      const categories = categoriesResults[0].map((row) => row.category).filter((category) => category !== null && category !== '');
      const locationTypes = locationTypesResults[0].map((row) => row.location_type).filter((location_type) => location_type !== null && location_type !== '');

      res.status(200).json({ categories, locationTypes });
    } else {
      return res.status(404).json({ message: 'No categories or location types found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export {
   getExhibits,
   getExhibitById,
   createExhibit,
   updateExhibit,
   deleteExhibits,
   undoDeleteExhibits, 
   uploadFilestoS3, 
   generatePreSignedUrl, 
   addRelatedExhibits, 
   previewImage, 
   rollbackAttachment, 
   deleteObjectsFromS3, 
   getAttachments, 
   getNextAssetNumber,
   getCategoriesAndLocationTypes
};