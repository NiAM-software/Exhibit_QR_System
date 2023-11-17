import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload, message, Button } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { DeleteOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';
import dummyImageUrl from '../assets/dummy-image-square.jpg';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Modifyfiles = ({
  files,
  setFiles,
  deletefiles,
  setdeletefiles,
  formSubmitted,
  id,
  resetFormSubmitted,
  nOK,
  nCancel,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [initialFileList, setInitialFileList] = useState([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState([]);
  const [previewFileType, setPreviewFileType] = useState('');

  const isVideoLink = (link) => /\.(mp4|webm)(\?|$)/i.test(link);

  const fetchImageUrls = async () => {
    try {
      const attachmentsResponse = await axios.get(
        `/api/admin/exhibits/get-attachments/${id}`
      );
      const attachmentsData = attachmentsResponse.data.data;
      const attachmentsArray = attachmentsData.map((attachment) => ({
        fileName: attachment.file_name,
        folderName: attachment.file_location,
      }));
      // console.log(attachmentsArray);
      //Get Presigned urls
      const presignedUrlResponse = await fetch(
        "/api/admin/exhibits/generate-presigned-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attachmentsArray),
        }
      );
      const presignedUrlsData = await presignedUrlResponse.json();

      const presignedUrls = presignedUrlsData.data;

      const newFileList = presignedUrls
        .map((item, index) => {
          if (item.url) {
            return {
              uid: `${index}`,
              name: item.fileName, // Use fileName from the presigned URLs
              status: "done",
              url: item.url,
              folderName: item.folderName,
            };
          }
          // Handle errors if there is an error message
          if (item.error) {
            return {
              uid: `-${index}`,
              name: item.fileName,
              status: "error",
              response: item.error,
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log('newFileList', newFileList);
      //console.log(newFileList);
      setFileList(newFileList);
      setInitialFileList(newFileList);
      setFiles(newlyAddedFiles);
      setdeletefiles(deletedFiles);
    } catch (error) {
      console.error("Error fetching image URLs:", error);
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
    display: "flex",
    justifyContent: "flex-end", // Right-align the buttons
    marginTop: "20px", // Adjust the margin as needed
    width: "40px",
  };

  const handlePreview = async (file) => {
    const isImage = typeof file.type === 'string' && file.type.startsWith('image/');
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(file.name);


    if (!file.url && !file.preview) {
      if (isImage) {
        // For image files
        file.preview = await getBase64(file.originFileObj);
      } else if (isVideo) {
        // For video files, create an object URL for preview
        file.preview = URL.createObjectURL(file.originFileObj);
      }
    }
    console.log('FILE', file);
    setPreviewFile(file.url || file.preview);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    setPreviewFileType(isVideo ? 'video' : 'image');
    setPreviewOpen(true);

  };

  useEffect(() => {
    // Clean up function to revoke object URLs
    return () => {
      if (previewFileType === 'video') {
        URL.revokeObjectURL(previewFile);
      }
    };
  }, [previewFile, previewFileType]);

  const renderItem = (originNode, file, fileList, actions) => {
    const thumbnailStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      overflow: 'hidden', // To handle videos that might exceed the container size
    };
    const actionButtonStyle = {
      background: 'transparent',
      border: 'none', // Remove button border
      boxShadow: 'none', // Remove button shadow if any
    };

    console.log('fil', file);
    const isLocalFile = file.originFileObj && !file.url;
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(file.name);

    // Create a URL for preview if the file is local
    if (isLocalFile && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
    const filePreviewUrl = file.url || file.preview;

    return (
      <div className="ant-upload-list-item">
        <div style={thumbnailStyle}>
          {isVideo ? (
            <video
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              controls
              src={filePreviewUrl}
            />
          ) : (
            <img
              src={filePreviewUrl}
              alt={file.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <div className="ant-upload-list-item-actions">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => {
              e.preventDefault();
              handlePreview(file);
            }}
          >
            <Button icon={<EyeOutlined />} size="small" style={actionButtonStyle} />
          </a>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            style={actionButtonStyle}
            onClick={() => actions.remove(file)}
          />
        </div>
      </div>
    );
  };

  const [unsupportedFiles, setUnsupportedFiles] = useState([]);

  const beforeUpload = (file) => {
    const allowedFormats = [
      'image/jpeg',
      'image/png',
      'video/mp4',
      'video/quicktime',
    ];
    const isSupported = allowedFormats.includes(file.type);

    if (!isSupported) {
      // Display error message
      message.error(`Unsupported file format: ${file.name}`);
      setUnsupportedFiles([...unsupportedFiles, file.type]); // Add the unsupported format to the list
      return false; // Return false to prevent the file from being uploaded
    }

    // Check if all selected files are supported and reset unsupportedFiles state if needed
    const allFilesSupported = fileList.every((item) =>
      allowedFormats.includes(item.type)
    );

    if (!allFilesSupported) {
      setUnsupportedFiles([]); // Reset unsupportedFiles state
    }

    return true; // Allow the file to be uploaded if it's of an allowed format
  };

  const handleChange = ({ fileList: newFileList, file }) => {
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ];
    // Filter out files with disallowed formats and update the file list

    const isDuplicate = fileList.some((item) => item.name === file.name);

    // if (isDuplicate && file.status != "removed") {
    //   message.error("Duplicate files are not allowed");
    //   return;
    // }


    const filteredFileList = newFileList.filter((item) => {
      if (item.status === "done" || allowedFormats.includes(item.type)) {
        return true;
      }
    });

    if (file.status === "removed") {
      // You can identify the removed file by comparing with the initial list
      const removedFile_initial = initialFileList.find(
        (initialFile) => initialFile.name === file.name
      );
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
      } else {
        const removednewfilename = newlyAddedFiles.find(
          (item) => item.name == file.name
        );
        if (removednewfilename) {
          const newaddedfiles = newlyAddedFiles.filter(
            (item) => item.name !== removednewfilename.name
          );
          setNewlyAddedFiles(newaddedfiles);
          setFiles(newaddedfiles);
        }
      }
    }

    const newlyAdded = [];

    filteredFileList.forEach((file) => {
      const isNewlyAdded = !fileList.some(
        (initialFile) => initialFile.name === file.name
      );
      if (isNewlyAdded && file.status !== "removed") {
        newlyAdded.push(file);
      }
    });

    if (newlyAdded.length > 0) {
      setNewlyAddedFiles([...newlyAddedFiles, ...newlyAdded]);
      setFiles([...newlyAddedFiles, ...newlyAdded]);
    }
    setFileList(filteredFileList);
  };

  // console.log("Deletedfiles", deletedFiles);
  // console.log("newlyAddedFiles", newlyAddedFiles);
  // console.log("Filelist", fileList);
  // console.log("formfiles", files);
  // console.log("deletefilesform", deletefiles);

  const handleSubmit = () => {
    if (fileList.length > 0) {
      message.success("Files are uploaded successfully");
    } else {
      message.info("Please select atleast one file to upload");
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
      <div style={{ paddingTop: '8px', paddingBottom: '4px' }}>
        <Upload
          beforeUpload={beforeUpload}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          multiple={true}
          itemRender={(originNode, file, fileList, actions) => renderItem(originNode, file, fileList, actions)}
        >
          {uploadButton}
        </Upload>
      </div>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        {previewFileType === 'video' ? (
          <video style={{ width: '100%' }} controls>
            <source src={previewFile} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        ) : (
          <img alt="example" style={{ width: '100%' }} src={previewFile} />
        )}
      </Modal>
    </div>

  );
};

export default Modifyfiles;