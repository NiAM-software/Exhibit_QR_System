import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button } from 'antd';
import axios from 'axios';

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
  const [fileList, setFileList] = useState([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
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
    </div>
  );
};
export default Addfiles;