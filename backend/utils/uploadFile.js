import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();
import s3 from '../config/s3_config.js'

//check if object exists
const objectExists = async (bucket, key) => {
  try {
    await s3.headObject({
      Bucket: bucket,
      Key: key,
    }).promise(); 
    return true; 
  } catch (err) {
    console.log(err);
    if (err.code === 'NotFound') {
      return false; 
    }
    throw err; // Rethrow other errors
  }
};

//delete object from s3
const deleteObjectFromS3 = async (bucket, key) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    // Delete the object
    await s3.deleteObject(params).promise();

    console.log(`Object deleted: ${key}`);
  } catch (error) {
    console.error(`Error deleting object: ${key}`, error.message);
    throw error;
  }
};


// Add object to s3
let folderName = 'default-folder'
const bucketName = process.env.S3_BUCKET; 

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: (req, file, cb) => {
      folderName = req.params?.exhibit_id? `exhibit_${req.params.exhibit_id}` : 'default-folder';
      // console.log("FOLDERNAME" + folderName);
      // console.log(file)
      cb(null, bucketName);
    },
    metadata: function (req, file, cb) {
      cb(null, { folderName: folderName, fieldName: file.fieldname });
    },
    key: async function (req, file, cb) {
      try {
        const folderExists = await objectExists(bucketName, folderName)
        // console.log(folderName);
        if (!folderExists) {
          console.log('folder doesnt exist');

          await s3.putObject({ 
            Bucket: bucketName, 
            Key: `${folderName}/` 
          })
          .promise();
        }

        // Set the key with folder name and file name
        const fileName = folderName+"_"+`exhibit_${Date.now().toString()}`;
        const key = `${folderName}/${fileName}`;
        cb(null, key);
      } catch (err) {
        cb(err.message);
      }
    },
  }),
});

//fetch presignedl url 
const getPresignedUrl = async (s3, bucket, key) => { // key - entire path 
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 60*60, // URL expiration time in seconds
    };

    // Check if the key exists
    const folderExists = await objectExists(bucket, key);
    
    if (!folderExists) {
      throw new Error('File doesnt exist');
    }

    const url = await s3.getSignedUrlPromise('getObject', params);

    if (!url) { // url will always be generated regardless
      throw new Error('Failed to generate presigned URL');
    }

    return url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export{
  upload,
  getPresignedUrl, 
  deleteObjectFromS3
}
