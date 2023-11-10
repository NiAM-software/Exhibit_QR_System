import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload, message, Button } from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { DeleteOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';

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
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [initialFileList, setInitialFileList] = useState([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState([]);

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
    console.log("PRECIEW");
    console.log(file);
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
      console.log("KKK");
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

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
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(file.url);
    return (
      <div className="ant-upload-list-item">
        <div style={thumbnailStyle}>
          {isVideo ? (
            <video
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              controls
              src={file.url}
            />
          ) : (
            <img
              src={file.url}
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
      } else if (!allowedFormats.includes(item.type)) {
        message.error(
          "You can only upload image and video files (JPEG, PNG, MP4, QuickTime)!"
        );
        //return false;
      } else if (item.status === "error") {
        message.error(`Error uploading ${item.name}: ${item.response}`);
        //return false;
      }
      //return true; // Exclude files with disallowed formats or errors
      //filterconditions(item);
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
          beforeUpload={() => false}
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
        {isVideoLink(previewImage) ? (
          <video style={{ width: '100%' }} controls>
            <source src={previewImage} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        ) : (
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        )}
      </Modal>
    </div>

  );
};

export default Modifyfiles;