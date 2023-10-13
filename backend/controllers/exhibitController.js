import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import AWS from 'aws-sdk';
import { getPresignedUrl } from '../utils/uploadFile.js'; // Import utility function
import s3 from '../config/s3_config.js'
import dotenv from 'dotenv';
dotenv.config();
// @desc    Fetch all exhibits
// @route   GET /api/exhibits
// @access  Private/Admin
const getExhibits = asyncHandler(async (req, res) => {
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
    console.log(exhibits.length);
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
    console.log(results);
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
  try {
    const query = 'INSERT INTO exhibits (title, category, subcategory, room, location_type, location, asset_number, era, exhibit_desc, active_ind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [results, fields] = await db.promise().query(query, [title, category, subcategory, room, location_type, location, asset_number, era, exhibit_desc,'Y']);

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
  const { ids } = req.body; // Assuming you send an array of IDs in the request body

  try {
    // Use a single SQL query to delete multiple exhibits based on IDs
    const deleteQuery = "UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?) AND active_ind='Y'";
    const [deleteResults, deleteFields] = await db.promise().query(deleteQuery, [ids]);

    if (deleteResults.affectedRows > 0) {
      return res.status(200).json({ message: "Successfully deleted exhibits" });
    } else {
      return res.status(404).json({ message: "No exhibits were deleted" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    undo Delete exhibit
// @route   PUT /api/exhibits/:id
// @access  Private/Admin
const undoDeleteExhibit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id=? AND active_ind='N'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE exhibits SET active_ind='Y' WHERE exhibit_id=?";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [id]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully restored exhibit" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "Couldn't restore exhibit" });
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
    //console.log(objectKeys);
    if (!Array.isArray(objectKeys)) {
      return res.status(400).json({ error: 'Invalid input. objectKeys should be an array.' });
    }

    const urls = await Promise.all(objectKeys.map(async (objectKey) => {
      try {
        const url = await getPresignedUrl(s3, bucketName, objectKey);
        return { objectKey, url };
      } catch (error) {
        console.error(`Error generating presigned URL for ${objectKey}:`, error.message);
        return { objectKey, error: error.message };
      }
    }));

    res.json({ urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export {
   getExhibits,
   getExhibitById,
   createExhibit,
   updateExhibit,
   deleteExhibits,
   undoDeleteExhibit, 
   uploadFilestoS3, 
   generatePreSignedUrl
};