import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import React, { useState, useContext, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Modal, Input } from "antd";
import Addfiles from "./AddFiles";
import AddLinks from "./AddLinks";

const AddExhibitScreen = () => {
  const [links, setLinks] = useState([]); // Add this state for links
  const [isLinksModalVisible, setIsLinksModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [linkList, setLinkList] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [parsedLinkList, setParsedLinkList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [rooms, setrooms] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [nextAvailableAssetNumber, setNextAvailableAssetNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Axios.get('/api/admin/exhibits/next-asset-number')
      .then((response) => {
        const maxAssetNumber = response.data.asset_number;
        console.log(maxAssetNumber)
        const nextAssetNumber = maxAssetNumber + 1;
        //  setFormData({ ...formData, asset_number: nextAssetNumber.toString(), });
        setFormData({ ...formData, asset_number: nextAssetNumber.toString(), });
      })
      .catch((error) => {
        console.error('Error fetching next asset number:', error);
        toast.error('Error fetching next asset number')
      });
  }, []);


  const handleupdatedfiles = (newList) => {
    setFileList(newList);
  };

  const handleupdatedlinks = (newList) => {
    setLinkList(newList);
    console.log('exhibit', linkList)
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
    title: "",
    category_id: "",
    category: "",
    subcategory: "",
    room_id: "",
    room: "",
    id: "",
    location_type: "",
    location: "",
    asset_number: "",
    manufacturer: "",
    era: "",
    exhibit_desc: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChange_category = (e) => {
    const { name, value } = e.target;
    //console.log("name,value",name,value);
    const selectedCategoryId = categories.find(
      (item) => item.name === value
    )?.id;

    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedCategoryId, // Update category_id
      category: value, // Update category
    }));

  };

  const handleChange_locationtype = (e) => {
    const { name, value } = e.target;
    const selectedlocationtypeId = locationTypes.find(
      (location_type) => location_type.name === value
    )?.id;
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedlocationtypeId, // Update category_id
      location_type: value, // Update category
    }));
  };

  const handleChange_room = (e) => {
    const { name, value } = e.target;
    const selectedroomId = rooms.find(
      (room) => room.name === value
    )?.id;
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedroomId, // Update category_id
      room: value, // Update category
    }));
  };

  const handleCancelClick = () => {
    navigate("/");
  };

  const fetch_maintenance_fields = async () => {
    try {
      const response = await fetch(
        "/api/admin/exhibits/maintenance"
      );
      if (response.ok) {
        const data = await response.json();
        //console.log("data",data);
        setCategories(data.categories);
        setLocationTypes(data.locationTypes);
        setrooms(data.rooms);
      } else {
        console.error("Failed to fetch maintenance fields");
      }
    } catch (error) {
      console.error("Error while fetching maintenance fields:", error);
    }
  };

  useEffect(() => {
    fetch_maintenance_fields();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.title) {
      errors.title = 'Title is required';
    }
    if (!formData.asset_number) {
      errors.asset_number = 'Asset number is required';
    } else if (isNaN(formData.asset_number)) {
      errors.asset_number = 'Asset number must be an integer';
    } else if (formData.asset_number < 0) {
      errors.asset_number = 'Asset number cannot be negative';
    }

    return errors;
  };

  const rollbackCall = async (exhibit_id) => {
    // console.log()
    try {
      console.log(exhibit_id);
      const rollback = await fetch(`api/admin/exhibits/rollback/${exhibit_id}`, {
        method: 'DELETE'
      });
      // console.log(rollback)
      if (!rollback.ok) {
        // If the response status is not in the range 200-299, consider it an error
        throw new Error(`Failed to rollback exhibit. Status: ${rollback.status}`);
      }
      console.log('Exhibit rolled back successfully');
    } catch (error) {
      console.log(error)
      console.error('Error rolling back exhibit:', error.message);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    setFormErrors({});
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      try {
        // First API call to your server
        const response = await fetch('/api/admin/exhibits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('First API Call Successful:', data.message);

          const new_exhibit_id = data.id
          const formDataForFiles = new FormData(); // Use FormData instead of fileObjects
          fileList.forEach((file) => {
            formDataForFiles.append('photos', file.originFileObj);
          });


          // Second API call to Amazon S3
          const s3Response = await fetch(`api/admin/exhibits/upload/${new_exhibit_id}`, {
            method: 'POST', // or 'PUT' or 'whatever is necessary'
            body: formDataForFiles,
          });

          if (s3Response.ok) {
            const s3Data = await s3Response.json();
            console.log('Second API Call to S3 Successful:', s3Data);


            // console.log('linkList after submitting the modal:', linkList);
            const parsedLinkList = linkList.map(link => ({
              related_exhibit_id: link.uid,
              related_exhibit_title: link.name,
            }));

            // console.log('Parsed Link List:', parsedLinkList);
            setIsLinksModalVisible(false);

            // Set the submitted link list
            setParsedLinkList(parsedLinkList);

            const rdata = {
              related_exhibits_ids: parsedLinkList
            };

            // console.log(rdata)


            // Third API call to DB  
            const dbResponse = await fetch(`/api/admin/exhibits/add-related-exhibits/${new_exhibit_id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(rdata),
            });

            if (dbResponse.ok) {
              setIsLoading(false);
              toast.success('Form data submitted successfully');
              setFormSubmitted(true);
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
            else {
              setIsLoading(false);
              const data = await dbResponse.json();
              console.error('Third API Call to DB Failed:', data.message);
              toast.error('Failed to insert related exhibits');
            }
          }
          else {
            setIsLoading(false);
            console.error('Second API Call to S3 Failed:', s3Response.statusText);
            toast.error("Second API Call to S3 Failed");
            setTimeout(() => {
              rollbackCall(new_exhibit_id);
            }, 2000);
          }
        }

        else {
          setIsLoading(false);
          const data = await response.json();
          console.error('First API Call Failed:', data.message);

          if (data.message.includes('Duplicate entry')) {
            const errors = {};
            errors.asset_number = 'Duplicate entries not allowed.';
            setFormErrors(errors);
            // toast.error('Duplicate entries in Asset Number.', { duration: 1000 });
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


    }

    else {
      setFormErrors(errors);
    }

  };

  const h1Style = {
    fontWeight: 'bold',
    fontSize: '22px',
    marginTop: '30px',
    marginLeft: '-20px',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const buttonContainerStyle = {
    // textAlign: "center", // Adjust this to align the labels and buttons
    // margin: "0 20px",    // Adjust the margin as needed
    marginTop: "20px"
  };
  const rightButtonContainerStyle = {
    display: "flex",
    //justifyContent: "flex-end", // Right-align the buttons
    alignItems: "center", // Vertically align the buttons
    marginTop: "38px"
  };

  const labelStyle = {
    fontSize: "11px",
    color: '#4B4B4B'
  };

  const buttonStyle = {
    fontSize: '14px',
    width: '125px',
    height: '25px',
    marginRight: '20px',
    marginTop: '0px',
    marginBottom: '50px'

  };
  // Define a custom style for the form labels
  const formLabelStyle = {
    fontSize: '14px', // Adjust the font size as needed
    marginTop: '-20px',
  };

  // Define a custom style for the space between form elements
  const formElementSpacing = {
    marginBottom: '-15px', // Adjust the margin-bottom as needed
  };

  const descriptionInputStyle = {
    fontSize: '14px', // Adjust the font size as needed
    height: '80px', // Adjust the height as needed
  };

  const TextInputStyle = {
    fontSize: '12px', // Adjust the font size as needed
    height: '45px', // Adjust the height as needed
  };

  const errorStyle = {
    borderColor: 'red',
  };

  const errorMessage = {
    color: 'red',
  };


  return (
    <Container className="AddExhibit">
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Uploading...</p>
        </div>
      )}
      <Row>
        <Col>
          <h1 style={h1Style}>Create New Exhibit</h1>
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
                  style={formErrors.title ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
                />
                {formErrors.title && <div style={errorMessage}>{formErrors.title}</div>}
              </Form.Group>
            </Form>
          </Col>

          <Col md={4} className="offset-md-3 mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="Asset Number" className="mb-3" style={{ position: 'relative' }}>
                <Form.Label style={formLabelStyle}>
                  Asset Number<span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="asset_number"
                  value={formData.asset_number}
                  onChange={handleChange}
                  placeholder="Enter Asset number"
                  style={formErrors.asset_number ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
                />
                {/* {nextAvailableAssetNumber && (
                  <div style={{ position: 'absolute', top: '0', right: '0', color: 'green', fontSize: '14px' }}>
                    Suggested: {nextAvailableAssetNumber}
                  </div>
                )} */}
                {formErrors.asset_number && <div style={errorMessage}>{formErrors.asset_number}</div>}
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
                  placeholder="Enter the location"
                  style={TextInputStyle}
                >
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>


          {/* Right Form */}

          <Col md={4} className="offset-md-3 mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="Room" className="mb-3">
                <Form.Label style={formLabelStyle}>Room</Form.Label>
                <Form.Control
                  as="select"
                  type="text"
                  name="room_id"
                  list="rooms"
                  value={formData.room}
                  onChange={handleChange_room}
                  style={TextInputStyle}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="locationType" className="mb-3">
                <Form.Label style={formLabelStyle}>LocationType</Form.Label>
                <Form.Control
                  as="select"
                  type="text"
                  name="loctype_id"
                  list="locationTypes"
                  value={formData.location_type}
                  onChange={handleChange_locationtype}
                  style={TextInputStyle}
                >
                  <option value="">Select a location_type</option>
                  {locationTypes.map((location_type) => (
                    <option key={location_type.id} value={location_type.name}>
                      {location_type.name}
                    </option>
                  ))}
                </Form.Control>
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
                  placeholder="Enter the Era"
                  //style={formErrors.era ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
                  style={TextInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col md={4} className=" mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="category" className="mb-3">
                <Form.Label style={formLabelStyle}>
                  Item Type
                </Form.Label>
                <Form.Control
                  as="select"
                  type="text"
                  name="category_id"
                  list="categories"
                  value={formData.category}
                  onChange={handleChange_category}
                  style={TextInputStyle}
                >
                  <option value="">Select a Item Type</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Form.Control>
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
                  placeholder="Enter the Sub-Category"
                  style={TextInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="Description" className="mb-3">
                <Form.Label style={formLabelStyle}>Description</Form.Label>
                <Form.Control
                  type="text"
                  as="textarea"
                  placeholder="Enter Description"
                  name="exhibit_desc"
                  value={formData.exhibit_desc}
                  onChange={handleChange}
                  style={descriptionInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>

          <Col md={4} className="offset-md-3 mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="Manufacturer" className="mb-3">
                <Form.Label style={formLabelStyle}>Manufacturer</Form.Label>
                <Form.Control
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Enter the Manufacturer"
                  style={TextInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Row>
          <Addfiles
            files={fileList}
            setFiles={handleupdatedfiles}
            formSubmitted={formSubmitted}
            resetFormSubmitted={() => setFormSubmitted(false)}
            nOK={handleOk}
            nCancel={handleCancel}
          />
        </Row>
        <Row>

          <p>Related Exhibits </p>
          <AddLinks
            links={linkList}
            setLinks={handleupdatedlinks}
            visible={isLinksModalVisible}
            // onSubmit={handleLinkSubmit}
            onCancel={handleLinksCancel}
          />
        </Row>
        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-end" style={rightButtonContainerStyle}>
              <button className="float-end" style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '8px 16px',
                fontSize: '12px',
                width: '100px',
                height: '25px',
                marginRight: '20px',
                marginTop: '-1px',
                marginBottom: '50px',
                outline: '1px solid black',
              }} onClick={handleCancelClick}>Cancel</button>

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