import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { Modal,Input} from 'antd';
import Addfiles from './AddFiles';
import AddLinks from './AddLinks';


const AddExhibitScreen = () => {

  //const [AddFileList, setAddFileList] = useState([]);

  const [links, setLinks] = useState([]); // Add this state for links
  const [isLinksModalVisible, setIsLinksModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [linkList, setLinkList] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [parsedLinkList, setParsedLinkList] = useState([]);

  
  const handleupdatedfiles = (newList) => {
    setFileList(newList);
  };

  const handleupdatedlinks =(newList) => {
    setLinkList(newList);
  }
  
  const showLinksModal = () => {
    setIsLinksModalVisible(true);
  };
  
  const handleLinksOk = () => {
    setIsLinksModalVisible(false);
  };
  
  const handleLinksCancel = () => {
    console.log("Cancel button clicked");
    setIsLinksModalVisible(false);
  };
  

const showModal = () => {
  setIsModalVisible(true);
};

const handleOk = () => {
  setIsModalVisible(false);
};

const handleCancel = () => {
  setIsModalVisible(false);
};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory:'',
    room:'',
    location_type:'',
    location:'',
    asset_number:'',
    era:'',
    exhibit_desc:''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCancelClick = () => {
    navigate('/');
  };


  const handleLinkSubmit = (updatedLinkList) => {
    // You can use the updatedLinkList received from AddLinks here
    console.log('linkList after submitting the modal:', updatedLinkList);
    const parsedLinkList = updatedLinkList.map(link => ({
      related_exhibit_id: link.uid,
      related_exhibit_title: link.name,
    }));
    
    console.log('Parsed Link List:', parsedLinkList);
    setIsLinksModalVisible(false);

    // Set the submitted link list
    setParsedLinkList(parsedLinkList);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
    
      if (!formData.title || !formData.asset_number) {
        toast.error('Please fill in mandatory fields title and asset number', { duration: 2000 });
        return;
      }
  
      // First API call to your server
      const response = await fetch('/api/exhibits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('First API Call Successful:', data.message);

        const new_exhibit_id=data.id
        const formDataForFiles = new FormData(); // Use FormData instead of fileObjects
        fileList.forEach((file) => {
          formDataForFiles.append('photos', file.originFileObj);
        });

  
        // Second API call to Amazon S3
        const s3Response = await fetch(`api/exhibits/upload/${new_exhibit_id}`, {
          method: 'POST', // or 'PUT' or 'whatever is necessary'
          body: formDataForFiles,
        });
  
        if (s3Response.ok) {
          const s3Data = await s3Response.json();
          console.log('Second API Call to S3 Successful:', s3Data);

           // Third API call to DB
          //console.log('herheheherhehehe')
          // console.log(linkList)

          const dbResponse = await fetch(`/api/exhibits/add-related-exhibits/${new_exhibit_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedLinkList),
          });

          if (dbResponse.ok){
            toast.success('Form data submitted successfully');
            setFormSubmitted(true);
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
          else {
            const data = await dbResponse.json();
            console.error('Third API Call to DB Failed:', data.message);
            toast.error('Failed to insert related exhibits');
          }
        } 
        
        else {
          console.error('Second API Call to S3 Failed:', s3Response.statusText);
          toast.error('Failed to upload to S3');
        }
      } 
      
      else {
        const data = await response.json();
        console.error('First API Call Failed:', data.message);
        if (data.message.includes('Duplicate entry')) {
          toast.error('Duplicate entries in Asset Number not allowed.');
        } 
        
        else {
          toast.error('Failed to submit form data.');
        }
      }
    } 
    
    catch (error) {
      console.error('Failed to submit form data', error);
      toast.error('An error occurred while submitting form data.');
      // Handle network or other errors here
    }
  };
  
  const h1Style = {
    fontWeight: 'bold',
    fontSize: '22px',
    marginTop: '30px',
    marginLeft:'460px',
    marginBottom:'20px',
    // textAlign:'center'
  };

  const buttonContainerStyle = {
    // textAlign: "center", // Adjust this to align the labels and buttons
    // margin: "0 20px",    // Adjust the margin as needed
    marginTop:"20px"
  };
  const rightButtonContainerStyle = {
    display: "flex",
    //justifyContent: "flex-end", // Right-align the buttons
    alignItems: "center", // Vertically align the buttons
    marginTop:"38px"
  };
  
  const labelStyle = {
    fontSize: "11px",
    color:'#4B4B4B'
  };

  const buttonStyle = {
    fontSize: '14px',
    width: '125px',
    height: '25px',
    marginRight:'20px',
    marginTop:'0px'

  };
  // Define a custom style for the form labels
  const formLabelStyle = {
    fontSize: '14px', // Adjust the font size as needed
    marginTop: '-20px',
  };

  // Define a custom style for the space between form elements
  const formElementSpacing = {
    marginBottom: '-5px', // Adjust the margin-bottom as needed
  };

  const descriptionInputStyle = {
    fontSize: '14px', // Adjust the font size as needed
    height: '80px', // Adjust the height as needed
  };

  const TextInputStyle = {
    fontSize: '12px', // Adjust the font size as needed
    height: '45px', // Adjust the height as needed
  };


  return (
    <Container className="AddExhibit">
      <Row>
        <Col> {/* Center-align the content */}
          <h1 style={h1Style}>
            Create New Exhibit
          </h1>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
          <Row>

            <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>

                <Form.Group controlId="Title" className="mb-3">
                  <Form.Label style={formLabelStyle}>Title<span style={{ color: 'red' }}>*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter Title"
                    style={TextInputStyle}/>
                </Form.Group>
              </Form>
            </Col>

            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Asset Number" className="mb-3">
                  <Form.Label style={formLabelStyle}>Asset Number<span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control 
                type="text"
                name="asset_number"
                value={formData.asset_number}
                onChange={handleChange} 
                placeholder="Enter Asset number"
                style={TextInputStyle} />
                </Form.Group>
              </Form>
            </Col>
          </Row>

          <Row>
          <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Location" className="mb-3">
                  <Form.Label style={formLabelStyle}>Location</Form.Label>
                  <Form.Control  
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange} 
                  style={TextInputStyle}
                  />
                </Form.Group>
              </Form>
            </Col>
          
          {/* Right Form */}
         
            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Room" className="mb-3">
                  <Form.Label style={formLabelStyle}>Room</Form.Label>
                  <Form.Control 
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange} 
                    style={TextInputStyle}
                    />
                </Form.Group>
              </Form>
            </Col>
            </Row>

          <Row>
            <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Location type" className="mb-3">
                  <Form.Label style={formLabelStyle}>Location type</Form.Label>
                  <Form.Control 
                    type="text"
                    name="location_type"
                    value={formData.location_type}
                    onChange={handleChange}
                    style={TextInputStyle}
                    />
                </Form.Group>
              </Form>
            </Col>

            {/* Right Form */}
            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Era" className="mb-3">
                  <Form.Label style={formLabelStyle}>Era</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="era"
                    value={formData.era}
                    onChange={handleChange}
                    style={TextInputStyle}
                    />
                </Form.Group>
              </Form>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Category" className="mb-3">
                  <Form.Label style={formLabelStyle}>Category</Form.Label>
                  <Form.Control 
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange} 
                    style={TextInputStyle}
                     />
                </Form.Group>
              </Form>
            </Col>

            {/* Right Form */}
            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Sub Category" className="mb-3">
                  <Form.Label style={formLabelStyle}>Sub Category</Form.Label>
                  <Form.Control 
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange} 
                style={TextInputStyle}
                />
                </Form.Group>
              </Form>
            </Col>
          </Row>

          <Col md={6} className="mb-4"> {/* Add custom class for margin-bottom */}
            <Form style={formElementSpacing}>
                <Form.Group controlId="Description" className="mb-3">
                    <Form.Label style={formLabelStyle}>Description</Form.Label>
                    <Form.Control 
                      type="text" as="textarea" 
                      placeholder="Enter Description"
                      name="exhibit_desc"
                      value={formData.exhibit_desc}
                      onChange={handleChange}
                      style={descriptionInputStyle}/>
                </Form.Group>
            </Form>
          </Col>
      
          <Row>
            <Col md={6}>
            <div className="float-start" style={buttonContainerStyle}>
                <label style={labelStyle}>Images/Videos</label>
                <button type="button" style={buttonStyle} onClick={showModal}>Add Files</button>
                <Modal
                    title="ADDFILES"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    closable={false}
                    footer={null}
                    style={{ height: '1200px',width:'1200px' }}
  
                    // okButtonProps={{ style: { background: 'blue', borderColor: 'black',width:'80px' } }}
                    // cancelButtonProps={{ style: { background: 'white', borderColor: 'black',width:'80px' } }}

                  >
                  {isModalVisible &&
                <Addfiles 
                files={fileList} 
                setFiles={handleupdatedfiles} 
                formSubmitted={formSubmitted}
                resetFormSubmitted={() => setFormSubmitted(false)}
                nOK={handleOk} 
                nCancel={handleCancel} />}  
                </Modal>
                
              </div>

              <div className="float-start" style={buttonContainerStyle}>
                <label style={labelStyle}>Related Exhibits</label>
                <button type="button" style={buttonStyle} onClick={showLinksModal}>
                  Add Links
                </button>
                <AddLinks
                  links={linkList}
                  setLinks={handleupdatedlinks}
                  visible={isLinksModalVisible}
                  onSubmit={handleLinkSubmit}
                  onCancel={handleLinksCancel}
                />
              </div>
             </Col>

            <Col md={6}>
              <div className="d-flex justify-content-end" style={rightButtonContainerStyle}>
                <button className="float-end" style={{
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '8px 16px',
                    fontSize: '12px',
                    width: '100px',
                    height: '25px',
                    marginRight: '15px',
                    marginTop:'-1px',
                    outline:'1px solid black',}} onClick={handleCancelClick}>Cancel</button>

                <button className="float-end" style={buttonStyle}>Submit</button>
              </div>
            </Col>
          </Row>
      </Form>




<Toaster />

    </Container>

    
  );
};



export default AddExhibitScreen;