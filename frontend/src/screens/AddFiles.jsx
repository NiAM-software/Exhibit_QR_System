import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button } from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';


const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Addfiles = ({
  files,
  setFiles,
  formSubmitted,
  resetFormSubmitted,
  nOK,
  nCancel,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");
  const [fileList, setFileList] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);
  const mediaRef = useRef(null);

  const handleCancel = () => {
    // Stop the media playback if it's a video or audio
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
    }

    setPreviewOpen(false);
    setPreviewImage('');
    setPreviewFileType('');
    setPreviewTitle('');
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      if (file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        file.preview = await getBase64(file.originFileObj);
        console.log("file preview", file.preview);
      }

    }
    console.log("file preview", file.url);
    console.log('FILE', file);
    setPreviewImage(file.url || file.preview);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
    setPreviewFileType(
      file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "image"
    );
    setPreviewOpen(true);
  };

  const beforeUpload = (file) => {
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
    ]; // Add audio formats
    const isSupported = allowedFormats.includes(file.type);

    if (!isSupported) {
      message.error(`Unsupported file format: ${file.name}`);
      setUnsupportedFiles([...unsupportedFiles, file.type]);
      return false;
    }

    const allFilesSupported = fileList.every((item) => allowedFormats.includes(item.type));

    if (!allFilesSupported) {
      setUnsupportedFiles([]);
    }

    return true;
  };

  const handleChange = ({ fileList: newFileList, file }) => {
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
    ]; // Add more formats as needed

    // Filter out unsupported files from the newFileList
    const filteredFileList = newFileList.filter((item) => {
      if (item.status === "error" || allowedFormats.includes(item.type)) {
        return true; // Keep the file in the list if it's either an allowed format or has an error status
      }
      return false; // Exclude unsupported files from the list
    });

    setFileList(filteredFileList);
    setFiles(filteredFileList);
  };

  const handleOKbutton = () => {
    if (fileList.length > 0) {
      message.success("Files are uploaded successfully");
    } else {
      message.info("Please select atleast one file to upload");
    }
    //setFileList([]);
    nOK();
  };

  const PreviewModalContent = ({ fileType, source }) => {
    useEffect(() => {
      // Ensure the media stops playing when the source changes
      if (mediaRef.current) {
        mediaRef.current.pause();
      }
    }, [source]);

    switch (fileType) {
      case 'video':
        return (
          <video ref={mediaRef} style={{ width: '100%' }} controls>
            <source src={source} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        );
      case 'audio':
        return (
          <audio ref={mediaRef} style={{ width: '100%' }} controls>
            <source src={source} type="audio/mpeg" />
            Your browser does not support HTML audio.
          </audio>
        );
      case 'image':
        return <img alt="example" style={{ width: '100%' }} src={source} />;
      default:
        return null;
    }
  };

  const goBackToHomePage = () => {
    // navigate('/AddExhibitScreen'); // Use navigate to navigate back to the home page
    setFileList([]);
    setFiles([]);
    //message.info('No files are uploaded');
    nCancel();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8, marginLeft: 16, marginRight: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    // Clean up function to revoke object URLs
    return () => {
      if (previewFileType === "video") {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, previewFileType]);

  const renderItem = (originNode, file, fileList, actions) => {
    const thumbnailStyle = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
      overflow: "hidden", // To handle videos that might exceed the container size
    };
    const actionButtonStyle = {
      background: "transparent",
      border: "none", // Remove button border
      boxShadow: "none", // Remove button shadow if any
    };

    return (
      <div className="ant-upload-list-item">
        <div style={thumbnailStyle}>
          {file.type.startsWith("video/") ? (
            <video
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              controls
              src={file.url || URL.createObjectURL(file.originFileObj)}
            />
          ) : file.type.startsWith("audio/") ? (
            <audio
              style={{ width: "100%" }}
              controls
              src={file.url || URL.createObjectURL(file.originFileObj)}
            />
          ) : (
            <img
              src={file.url || file.thumbUrl}
              alt={file.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
        <div className="ant-upload-list-item-actions">
          <a
            href={file.url || file.preview}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handlePreview(file);
            }}
          >
            <Button
              icon={<EyeOutlined />}
              size="small"
              style={actionButtonStyle}
            />
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

  return (
    <div style={{ position: "relative", marginBottom: "100px" }}>
      <div style={{ paddingTop: "8px", paddingBottom: "4px" }}>
        <p className="sub-heading-2">Attachments</p>

        <Upload
          beforeUpload={beforeUpload}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          multiple={true}
          itemRender={(originNode, file, fileList, actions) =>
            renderItem(originNode, file, fileList, actions)
          } // Pass actions here
        >
          {uploadButton}
        </Upload>
      </div>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <PreviewModalContent fileType={previewFileType} source={previewImage} />
      </Modal>
    </div>
  );
};
export default Addfiles;
