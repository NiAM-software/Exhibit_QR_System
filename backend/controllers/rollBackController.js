import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'

// @desc    Delete exhibit
// @route   DELETE /api/exhibits/rollback/:id
// @access  Private/Admin
const rollBackInsert = asyncHandler(async (req, res) => {
    const { id:exhibit_id  } = req.params;
    // console.log("HERE ",exhibit_id);
  
    try { // UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)
      const selectQuery = "SELECT * FROM exhibits WHERE exhibit_id IN (?) AND active_ind='Y'";
      const [selectResults, selectFields] = await db.promise().query(selectQuery, [exhibit_id]);
  
      if (selectResults && selectResults.length > 0) {
        console.log("reached here")
        const deleteQuery = "delete FROM exhibits WHERE exhibit_id IN (?)";
        const [updateResults, updateFields] = await db.promise().query(deleteQuery, [exhibit_id]);
  
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


  export default rollBackInsert;