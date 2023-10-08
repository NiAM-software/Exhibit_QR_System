import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import  S3Client from '@aws-sdk/client-s3'
import express from 'express';
import  multer from 'multer'
import multerS3 from 'multer-s3'
import upload from '../utils/uploadFile.js';

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

  try {
    const query = 'INSERT INTO exhibits (title, category, subcategory, room, location_type, location, asset_number, era, exhibit_desc, active_ind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [results, fields] = await db.promise().query(query, [title, category, subcategory, room, location_type, location, asset_number, era, exhibit_desc,'Y']);

    if (results && results.affectedRows > 0) {
      res.status(201).json({ message: 'Exhibit created successfully' });
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
const deleteExhibit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id=? AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE exhibits SET active_ind='N' WHERE exhibit_id=?";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [id]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted exhibit" }); // wrong status code for dev env
      } else {
        return res.status(500).json({ message: "Couldn't delete exhibit" });
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
  try {
    if (!req.files) res.status(400).json({ error: 'No files were uploaded.' })
    res.status(201).json({
      message: 'Successfully uploaded ' + req.files.length + ' files!',
      files: req.files
    })
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


export {
   getExhibits,
   getExhibitById,
   createExhibit,
   updateExhibit,
   deleteExhibit,
   undoDeleteExhibit, 
   uploadFilestoS3
};