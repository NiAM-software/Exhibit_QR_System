import React, { useState, useEffect } from 'react';
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

const Addfiles = ({ files, setFiles, formSubmitted, resetFormSubmitted, nOK, nCancel }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');
  const [fileList, setFileList] = useState([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      if (file.type.startsWith('image/')) {
        // For image files
        file.preview = await getBase64(file.originFileObj);
      } else if (file.type.startsWith('video/')) {
        // For video files, create an object URL for preview
        file.preview = URL.createObjectURL(file.originFileObj);
      }
    }
    console.log('FILE', file);
    setPreviewImage(file.url || file.preview);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    setPreviewFileType(file.type.startsWith('video/') ? 'video' : 'image');
    setPreviewOpen(true);
  };



  const handleChange = ({ fileList: newFileList, file }) => {

    const allowedFormats = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']; // Add more formats as needed
    if (!allowedFormats.includes(file.type)) {
      message.error('You can only upload image and video files (JPEG, PNG, MP4, QuickTime)!');
      return;
    }

    setFileList(newFileList);
    setFiles(newFileList);

  };

  const handleOKbutton = () => {
    if (fileList.length > 0) {
      message.success('Files are uploaded successfully');
    }
    else {
      message.info('Please select atleast one file to upload');
    }
    //setFileList([]);
    nOK();

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
      <div style={{ marginTop: 8, marginLeft: 16, marginRight: 8, }}>Upload</div>
    </div>
  );

  useEffect(() => {
    // Clean up function to revoke object URLs
    return () => {
      if (previewFileType === 'video') {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, previewFileType]);

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

    return (
      <div className="ant-upload-list-item">
        <div style={thumbnailStyle}>
          {file.type.startsWith('video/') ? (
            <video
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              controls
              src={file.url || URL.createObjectURL(file.originFileObj)}
            />
          ) : (
            <img
              src={file.url || file.thumbUrl}
              alt={file.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <div className="ant-upload-list-item-actions">
          <a
            href={file.url || file.preview}
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



  return (
    <div style={{ position: 'relative', marginBottom: '100px' }}>
      <div style={{ paddingTop: '8px', paddingBottom: '4px' }}>
        <p>Attachments</p>

        <Upload
          beforeUpload={() => false}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          multiple={true}
          itemRender={(originNode, file, fileList, actions) => renderItem(originNode, file, fileList, actions)} // Pass actions here
        >
          {uploadButton}
        </Upload>
      </div>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        {previewFileType === 'video' ? (
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
export default Addfiles;