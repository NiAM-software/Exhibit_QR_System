import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Modifyfiles = ({ files, setFiles, deletefiles, setdeletefiles, formSubmitted, id, resetFormSubmitted, nOK, nCancel }) => {

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [initialFileList, setInitialFileList] = useState([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState([]);

  const fetchImageUrls = async () => {
    try {

      const getAttachmentsResponse = await axios.get(`/api/admin/exhibits/get-attachments/${id}`);
      const attachmentsData = getAttachmentsResponse.data.data;

      const pathsArray = attachmentsData.map((item) => ({
        folderName: item.file_location,
        fileName: item.file_name,
      }));

      console.log("pathsArray", pathsArray);
      //Get Presigned urls
      const generatePresignedUrlResponse = await axios.post(`/api/admin/exhibits/generate-presigned-url`, {
        objectKeys: pathsArray,
      });


      const presignedUrls = generatePresignedUrlResponse.data;
      //console.log("presignedUrls", presignedUrls);

      const newFileList = presignedUrls.map((item, index) => {
        if (item.url) {
          return {
            uid: `${index}`,
            name: item.fileName, // Use fileName from the presigned URLs
            status: 'done',
            url: item.url,
            folderName: item.folderName,
          };
        }
        // Handle errors if there is an error message
        if (item.error) {
          return {
            uid: `-${index}`,
            name: item.fileName,
            status: 'error',
            response: item.error,
          };
        }
        return null;
      }).filter(Boolean);

      //console.log(newFileList);
      setFileList(newFileList);
      setInitialFileList(newFileList);
      setFiles(newlyAddedFiles);
      setdeletefiles(deletedFiles);

    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
  };

  useEffect(() => {
    fetchImageUrls();
  }, [id]);

  useEffect(() => {
    if (formSubmitted) {
      // Reset the fileList and setFiles when formSubmitted is true
      clearFileListInAddFiles();
      resetFormSubmitted();
    }
  }, [formSubmitted, resetFormSubmitted]);

  const clearFileListInAddFiles = () => {
    // Clear the fileList in the AddFiles component
    setFileList([]);
    setFiles([]);
    setDeletedFiles([]);
    setNewlyAddedFiles([]);
  };

  const handleCancel = () => setPreviewOpen(false);

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end', // Right-align the buttons
    marginTop: '20px', // Adjust the margin as needed
    width: '40px',
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };


  const handleChange = ({ fileList: newFileList, file }) => {

    const allowedFormats = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    // Filter out files with disallowed formats and update the file list

    const isDuplicate = fileList.some(item => item.name === file.name);

    if (isDuplicate && file.status != 'removed') {
      message.error('Duplicate files are not allowed');
      return;
    }
    const filteredFileList = newFileList.filter(item => {

      if (item.status === 'done' || allowedFormats.includes(item.type)) {
        return true;
      }
      else if (!allowedFormats.includes(item.type)) {
        message.error('You can only upload image and video files (JPEG, PNG, MP4, QuickTime)!');
        //return false;
      }
      else if (item.status === 'error') {
        message.error(`Error uploading ${item.name}: ${item.response}`);
        //return false;
      }
      //return true; // Exclude files with disallowed formats or errors
      //filterconditions(item);
    });

    if (file.status === 'removed') {
      // You can identify the removed file by comparing with the initial list
      const removedFile_initial = initialFileList.find(initialFile => initialFile.name === file.name);
      if (removedFile_initial) {
        // The file has been removed, you can take further action if needed
        console.log(`File removed: ${file.name}`);
        // You can also store information about the removed file
        const deletedFile = {
          fileName: removedFile_initial.name,
          folderName: removedFile_initial.folderName,
        };

        // Add the deleted file to the array
        setDeletedFiles([...deletedFiles, deletedFile]);
        setdeletefiles([...deletedFiles, deletedFile]);
      }
      else {
        const removednewfilename = newlyAddedFiles.find(item => item.name == file.name);
        if (removednewfilename) {
          const newaddedfiles = newlyAddedFiles.filter(item => item.name !== removednewfilename.name);
          setNewlyAddedFiles(newaddedfiles);
          setFiles(newaddedfiles);
        }
      }
    }

    // Initialize an array to accumulate newly added files
    const newlyAdded = [];
    //const newfiles=filteredFileList.filter(item => !FileList.includes(item));
    // Check each file to see if it's newly added and not removed
    filteredFileList.forEach(file => {
      const isNewlyAdded = !fileList.some(initialFile => initialFile.name === file.name);
      if (isNewlyAdded && file.status !== 'removed') {
        // Add newly added files to the array
        newlyAdded.push(file);
      }
    });

    if (newlyAdded.length > 0) {
      // Update the state with all newly added files that are not removed
      setNewlyAddedFiles([...newlyAddedFiles, ...newlyAdded]);
      setFiles([...newlyAddedFiles, ...newlyAdded]);
    }
    setFileList(filteredFileList);
    // Update the files state
    //console.log(filteredFileList);

  };

  console.log('Deletedfiles', deletedFiles);
  console.log('newlyAddedFiles', newlyAddedFiles);
  console.log('Filelist', fileList);
  console.log('formfiles', files);
  console.log('deletefilesform', deletefiles);

  const handleSubmit = () => {

    if (fileList.length > 0) {
      message.success('Files are uploaded successfully');
    }
    else {
      message.info('Please select atleast one file to upload')

    }
    nOK();
  };

  const goBackToHomePage = () => {
    setFileList(initialFileList);
    setFiles([]);
    setDeletedFiles([]);
    setNewlyAddedFiles([]);
    nCancel();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
          marginLeft: 16,
          marginRight: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: '16px' }}>
        <Upload
          beforeUpload={() => false}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          multiple={true}
        >
          {uploadButton}
        </Upload>
      </div>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          style={{
            width: '100%',
          }}
          src={previewImage}
        />
      </Modal>
      <div>
        <Button type="primary" onClick={handleSubmit}
          style={{
            // position: 'fixed',
            top: 50,
            left: 400,
            display: 'flex',
            //justifyContent: 'flex-end', // Right-align the buttons
            marginTop: '20px', // Adjust the margin as needed
            width: '60px',
            //buttonContainerStyle
          }}
        >
          OK
        </Button>
        <Button
          type="default"
          onClick={goBackToHomePage}
          style={{
            top: 1,
            //bottom:50,
            left: 300,
            //   width: '80px',
            display: 'flex',
            //justifyContent: 'flex-end', // Right-align the buttons
            marginTop: '20px', // Adjust the margin as needed
            width: '60px',
            //buttonContainerStyle
          }}
        >
          Cancel
        </Button>
      </div>

    </div>
  );
};

export default Modifyfiles;