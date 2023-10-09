import express from 'express';
import  multer from 'multer'
import multerS3 from 'multer-s3'
import AWS from 'aws-sdk';
import dotenv from 'dotenv'
dotenv.config()

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});


const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'niagara-museum-exhibits',
      metadata: function (req, file, cb) {
       // console.log(req);
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    })
  })

  export default upload