import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import s3 from '../config/s3_config.js'
import {upload} from '../utils/uploadFile.js';
import { 
  getPresignedUrl, 
  deleteObjectFromS3, 
  deleteObjectsFromS3, 
} from '../utils/uploadFile.js'; // Import utility function

import { 
  deleteAttachmentsUtils,
  getAttachmentsUtils,
  getPresignedUrlsUtils, 
  addRelatedExhibitsUtils, 
  deleteRelatedExhibitsUtils
} from '../utils/attachmentUtils.js';

// @desc    Fetch all exhibits
// @route   GET /api/exhibits
// @access  Private/Admin
const getExhibits = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
  ? `WHERE title LIKE '%${req.query.keyword}%' AND active_ind='Y'`
  : 'WHERE active_ind="Y"';

  const exhibitsQuery = `SELECT * FROM exhibits ${keyword}`;

  try {
    const [exhibitsResults] = await db.promise().query(exhibitsQuery);
    const exhibits = exhibitsResults;
    //console.log(exhibits.length);
    res.json({ exhibits }); 
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
    manufacturer,
    era, 
    exhibit_desc
  } = req.body;
  
  const era_int = era === '' ? null : parseInt(era, 10);
  try {
    const query = 'INSERT INTO exhibits (title, category, subcategory, room, location_type, location, asset_number, manufacturer, era, exhibit_desc, active_ind) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?)';
    const [results, fields] = await db.promise().query(query, [title, category, subcategory, room, location_type, location, asset_number, manufacturer, era_int, exhibit_desc,'Y']);

    if (results && results.affectedRows > 0) {
      const newExhibitId = results.insertId;
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
        manufacturer,
        era,
        exhibit_desc,
      } = req.body;

      console.log(req.body)

      // const era_int = era === '' ? null : parseInt(era, 10);
      
      const values = [
        title,
        category,
        subcategory,
        room,
        location_type,
        location,
        asset_number,
        manufacturer,
        era,
        exhibit_desc,
        id
      ];
      const updateQuery ="UPDATE exhibits SET title=?, category=?, subcategory=?, room=?, location_type=?, location=?, asset_number=?,manufacturer=?, era=?, exhibit_desc=? WHERE exhibit_id=? and active_ind='Y'";
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
    console.log(err.message)
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

  const { ids } = req.body.data;
  
  try { // UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)
    const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id IN (?) AND active_ind='N'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE exhibits SET active_ind='Y' WHERE exhibit_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
     
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
 
});


//folder structure
const generatePreSignedUrl = asyncHandler(async (req, res) => {
  try {
    const objectKeys = req.body // Parse the request body properly
    console.log(objectKeys);
    const presignedURLS = await getPresignedUrlsUtils(objectKeys);
    res.status(200).json({data:presignedURLS});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// @desc    Add a related exhibit
// @route   POST /api/exhibits/add-related-exhibit
// @access  Private/Admin
const addRelatedExhibits = asyncHandler(async (req, res) => {
  const { id:exhibit_id } = req.params;
  const  {related_exhibits_ids}  = req.body;
  try {
    const insertResult = await addRelatedExhibitsUtils(exhibit_id, related_exhibits_ids);

    return res.status(200).json({
      message: "Successfully inserted relationships",
      insertedRelationships: insertResult,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    get related exhibits -> images, urls 
// @route   POST /api/exhibits/get-related-exhibit
// @access  Private/Admin
const getRelatedExhibits = asyncHandler(async (req, res) => {
  const { id } = req.params;


  try {
    const selectQuery = `
    select related_exhibit_id, related_exhibit_title, file_name, file_location 
    from (
      select img.related_exhibit_id, img.related_exhibit_title, atch.file_name, atch.file_location,
      row_number() over (partition by img.related_exhibit_id order by atch.file_name) as rn
      FROM  attachments atch
      right join (
        select distinct related_exhibit_id, related_exhibit_title
        from related_exhibits re
        inner join exhibits e on re.related_exhibit_id = e.exhibit_id and e.active_ind = 'Y'
        where re.exhibit_id = ?
      ) img
      on atch.exhibit_id = img.related_exhibit_id
    ) images 
    where rn = 1`;

    const [existenceResults, existenceFields] = await db.promise().query(selectQuery, [id]);
  
    if (!existenceResults || existenceResults.length === 0) {
      return res.status(404).json({ message: "Related Exhibit doesn't exist" });
    }

    res.status(200).json({ message: "Related Exhibits retrieved successfully", data: existenceResults });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @desc    get related exhibits -> images, urls 
// @route   POST /api/exhibits/get-related-exhibit
// @access  Private/Admin
const modifiedRelatedExhibits = asyncHandler(async (req, res) => {
  const { id:exhibit_id } = req.params;
  const { exhibitsToBeDeleted, exhibitsToBeAdded } = req.body;
  try {
   

    const deletionResult = await deleteRelatedExhibitsUtils(exhibit_id, exhibitsToBeDeleted);
    const insertResult = await addRelatedExhibitsUtils(exhibit_id, exhibitsToBeAdded);
    return res.status(200).json({
      message: 'Exhibits modified successfully',
      insertedRelationships: insertResult,
      deletionRelationships: deletionResult
    });
  } catch (err) {
    res.status(500).json({ message: err.message }); // Send an error response
  }
});


// @desc    preview image of an exhibit
// @route   GET /api/exhibits/preview-image/:id
// @access  Private/Admin
const previewImage = asyncHandler(async (req, res) => {
  const {id} = req.params // exhibit_id
  // console.log(id)
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
    const attachments = await deleteAttachmentsUtils(fileName, folderName);
    if (attachments.message === "Successfully deleted") {
      const { message, ...attachmentData } = attachments;
      res.status(200).json(attachments);
    } else {
      res.status(404).json({ message: attachments.message });
    } 
  } catch (err) {
    res.status(500).json({ message: err.message }); // Send an error response
  }
});


// const deleteObjectsFromS3 = async (req, res) => {
//   try {
//     const { objectKeys } = req.body;

//     if (!Array.isArray(objectKeys)) {
//       return res.status(400).json({ error: 'Invalid input. objectKeys should be an array.' });
//     }

//     const bucket = process.env.S3_BUCKET;

//     // Delete each object in parallel
//     await Promise.all(objectKeys.map(async (objectKey) => {
//       const { folderName, fileName } = objectKey;
//       const key = fileName.length > 0 ? `${folderName}/${fileName}` : folderName;
//       console.log(key);
//       await deleteObjectFromS3(bucket, key);
//     }));

//     return res.status(200).json('All objects deleted successfully.');
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };





// @desc    Fetch all attachments file locations
// @route   GET /api/exhibits/:id
// @access  Private/Admin
const getAttachments = asyncHandler(async (req, res) => {
  const {exhibit_id} = req.params
  try {
    const attachments = await getAttachmentsUtils(exhibit_id);
    if (attachments.message === "Successfully fetched") {
      const { message, ...attachmentData } = attachments;
      res.status(200).json(attachments);
    } else {
      res.status(404).json({ message: attachments.message });
    } 
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})

const getNextAssetNumber = asyncHandler(async (req, res) => {
  try {
    const query = "SELECT MAX(asset_number) AS max_asset_number FROM exhibits";
    const [results, fields] = await db.promise().query(query);    
    if (results && results.length > 0) {
      const maxAssetNumber = results[0].max_asset_number || 0;
      return res.status(200).json({ message: "max asset number retrieved", asset_number: maxAssetNumber });
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

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
   modifiedRelatedExhibits,
   getAttachments, 
   getNextAssetNumber,
   getCategoriesAndLocationTypes, 
   getRelatedExhibits, 

};