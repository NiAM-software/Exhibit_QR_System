import { Container, Row, Col, Form } from 'react-bootstrap';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AddExhibitScreen = () => {
  const navigate = useNavigate();
  // const formRef = useRef(null);

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


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/api/exhibits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json(); // Parse the JSON response
        console.log(data.message); 
        console.log('Form data submitted successfully');
        // You can handle success, redirect, or update the UI here
      } else {
        console.error('Failed to submit form data');
        // Handle error cases here
      }
    } catch (error) {
      console.log('Failed to submit form data')
      // Handle network or other errors here
    }
  };

  const h1Style = {
    fontWeight: 'bold',
    fontSize: '25px',
    marginTop: '-30px',
    marginLeft:'400px'
  };

  const buttonStyle = {
    fontSize: '16px',
    width: '120px',
    height: '25px',
    marginLeft: '20px',
  };
  // Define a custom style for the form labels
  const formLabelStyle = {
    fontSize: '18px', // Adjust the font size as needed
    marginTop: '-50px',
  };

  // Define a custom style for the space between form elements
  const formElementSpacing = {
    marginBottom: '0px', // Adjust the margin-bottom as needed
  };

  const descriptionInputStyle = {
    fontSize: '20px', // Adjust the font size as needed
    height: '100px', // Adjust the height as needed
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
                  <Form.Label style={formLabelStyle}>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter Title"/>
                </Form.Group>
              </Form>
            </Col>

            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Asset Number" className="mb-3">
                  <Form.Label style={formLabelStyle}>Asset Number</Form.Label>
                <Form.Control 
                type="text"
                name="asset_number"
                value={formData.asset_number}
                onChange={handleChange} 
                placeholder="Enter Asset number" />
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
                    placeholder="Enter Category" />
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
                placeholder="Enter Sub-Category" />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Room" className="mb-3">
                  <Form.Label style={formLabelStyle}>Room</Form.Label>
                  <Form.Control 
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange} 
                    placeholder="Enter Room" />
                </Form.Group>
              </Form>
            </Col>

            {/* Right Form */}
            <Col md={4} className="offset-md-3 mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Location" className="mb-3">
                  <Form.Label style={formLabelStyle}>Location</Form.Label>
                  <Form.Control  
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange} 
                  placeholder="Enter Location" />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-3">
              <Form style={formElementSpacing}>
                <Form.Group controlId="Location_type" className="mb-3">
                  <Form.Label style={formLabelStyle}>Location_type</Form.Label>
                  <Form.Control 
                    type="text"
                    name="location_type"
                    value={formData.location_type}
                    onChange={handleChange}
                    placeholder="Enter location_type" />
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
                    placeholder="Enter Era" />
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
          <div className="col-auto">
            <button className="float-start" style={buttonStyle}>Add Files</button>
            <button className="float-start" style={buttonStyle}>Add Links</button>
          </div>
        </Col>
        <Col md={6}>
          <div className="col-auto d-flex justify-content-end">
            <button className="float-end" style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '8px 16px',
                fontSize: '12px',
                width: '120px',
                height: '25px',
                marginLeft: '15px',
                outline:'1px solid black',}} onClick={handleCancelClick}>Cancel</button>
      <button className="float-end" style={buttonStyle}>Submit</button>
      </div>
        </Col>
      </Row>
      </Form>
    </Container>
  );
};



export default AddExhibitScreen;