import React, { useState} from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Addfiles = ({files,setFiles,nOK,nCancel}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([ ]);
  const navigate = useNavigate();

  const handleCancel = () => setPreviewOpen(false);

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end', // Right-align the buttons
    marginTop: '20px', // Adjust the margin as needed
    width:'40px',
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList, file }) =>{ 
    
    const allowedFormats = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']; // Add more formats as needed
    if (!allowedFormats.includes(file.type)) {
      message.error('You can only upload image and video files (JPEG, PNG, MP4, QuickTime)!');
      return ;
    }
    
    setFileList(newFileList);
    setFiles(newFileList);

  };

  const handleSubmit = () => {
    // Prepare the uploaded files for sending to the backend
    // const formData = new FormData();
    // fileList.forEach((file) => {
    //   formData.append('files', file.originFileObj);
    // });
    
    // navigate('/AddExhibitScreen');
    if(fileList.length>0){
    message.success('Files are uploaded successfully');}
    else{
        message.info('Please select files to upload');
    }
    setFileList([]);
    nOK();

  };

  const goBackToHomePage = () => {
    // navigate('/AddExhibitScreen'); // Use navigate to navigate back to the home page
    setFileList([]);
    setFiles([]);
    message.info('No files are uploaded');
    nCancel();

  };

  const uploadButton = (
    <div>
      <PlusOutlined/>
      <div
        style={{
          marginTop: 8,
          marginLeft:16,
          marginRight:8,
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
        top:50,
        left: 400,
        display: 'flex',
        //justifyContent: 'flex-end', // Right-align the buttons
        marginTop: '20px', // Adjust the margin as needed
        width:'60px',
        //buttonContainerStyle
        }}
      >
        Upload
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
          width:'60px',
        //buttonContainerStyle
        }}
      >
        Cancel
      </Button>
      </div>

    </div>
  );
};
export default Addfiles;