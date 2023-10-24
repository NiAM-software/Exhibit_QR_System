import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'

import dotenv from 'dotenv';
dotenv.config();

// exhibit description
// image urls - 5
// related exhibits - 2

// @desc    Fetch exhibit description, image links, related exhibit names
// @route   GET /api/user/exhibit/:id
// @access  Public 
const getExhibitForUser = asyncHandler(async (req, res) => {
  const {id} = req.params
 
  try {
    const query = "SELECT desc FROM exhibits WHERE exhibit_id=? and active_ind='Y'";
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
export {
    getExhibitForUser
}