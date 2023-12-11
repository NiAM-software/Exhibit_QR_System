import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useHistory } from "react-router-dom";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "antd";
import Modifyfiles from "./Modifyfiles";
import Modifylinks from './ModifyLinks';

const EditExhibitScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [deletefiles, setdeletefiles] = useState([]);
  const [linkList, setLinkList] = useState([]);
  const [isLinksModalVisible, setIsLinksModalVisible] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [nextAvailableAssetNumber, setNextAvailableAssetNumber] = useState("");
  const [parsedLinkList, setParsedLinkList] = useState([]);
  const [deletelinks, setdeletelinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [rooms, setrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isformLoading, setIsformLoading] = useState(false);

  const fetchCategoriesAndLocationTypes = async () => {
    try {
      const response = await fetch(
        "/api/admin/exhibits/maintenance"
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setLocationTypes(data.locationTypes);
        setrooms(data.rooms);
      } else {
        console.error("Failed to fetch maintenance");
      }
    } catch (error) {
      console.error("Error while fetching maintenance fields:", error);
    }
  };




  const handleupdatedfiles = (newList) => {
    setFileList(newList);
  };

  const handledeletefiles = (newList) => {
    setdeletefiles(newList);
  };

  const handleupdatedlinks = (newList) => {
    setLinkList(newList);
  };
  const handledeletelinks = (newList) => {
    setdeletelinks(newList);
  };
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
  const { id } = useParams();
  const link_id = id;

  const [SubmitData, setFormData] = useState({
    title: "",
    category_id: "",
    category: "",
    subcategory: "",
    room_id: "",
    room: "",
    loctype_id: "",
    location_type: "",
    location: "",
    asset_number: "",
    manufacturer: "",
    era: "",
    exhibit_desc: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsformLoading(true);

        // First API call
        const exhibitResponse = await Axios.get(`/api/admin/exhibits/${id}`);
        console.log("response.data", exhibitResponse.data);
        setFormData(exhibitResponse.data); // Store data in state for prepopulation
        console.log("formdata", SubmitData);

        fetchCategoriesAndLocationTypes(); // Assuming this is a synchronous function

        if (!exhibitResponse.data.asset_number) {
          // Second API call based on the data from the first API call
          const response2 = await fetch(`/api/admin/exhibits/next-asset-number`);
          const data2 = await response2.json();

          const maxAssetNumber = data2.asset_number;
          const nextAssetNumber = maxAssetNumber + 1;

          // Update the formData with the nextAssetNumber only if asset_number is null
          setFormData((prevData) => ({
            ...prevData,
            asset_number: nextAssetNumber.toString(),
          }));

          // Continue with any other logic based on the data from the second API call
        }

        setIsformLoading(false);

      } catch (error) {
        console.error("Error fetching data:", error);
        setIsformLoading(false);
      }
    };

    fetchData(); // Invoke the function

  }, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...SubmitData, [name]: value });
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

  const handleLinkSubmit = (updatedLinkList) => {
    console.log("linkList after submitting the modal:", updatedLinkList);
    const parsedLinkList = updatedLinkList.map((link) => ({
      related_exhibit_id: link.uid,
      related_exhibit_title: link.name,
    }));

    console.log("Parsed Link List:", parsedLinkList);
    setIsLinksModalVisible(false);

    // Set the submitted link list
    setParsedLinkList(parsedLinkList);
  };

  const validateForm = () => {
    const errors = {};

    if (!SubmitData.title) {
      errors.title = "Title is required";
    }

    if (!SubmitData.asset_number) {
      errors.asset_number = "Asset number is required";
    } else if (isNaN(SubmitData.asset_number)) {
      errors.asset_number = "Asset number must be an integer";
    } else if (SubmitData.asset_number < 0) {
      errors.asset_number = "Asset number cannot be negative";
    }


    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    setFormErrors({});
    const errors = validateForm();
    console.log("formData.title", SubmitData.category_id);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {

        console.log("formData", SubmitData);
        const response = await fetch(`/api/admin/exhibits/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(SubmitData),
        });

        //console.log(response)

        if (response.ok) {
          // const data = await response.json(); // Parse the JSON response
          // console.log('First API call is successful', data.message);

          const formData = new FormData();
          // console.log("ADDED FILES");
          // console.log(fileList);
          formData.append("filesToBeDeleted", JSON.stringify(deletefiles)); // Assuming filePaths is an array of file paths to be deleted
          fileList.forEach((file) => {
            formData.append("newFiles", file.originFileObj);
          });

          const res = await fetch(
            `/api/admin/exhibits/add-modified-files/${id}`,
            {
              method: "POST", // or 'PUT' or 'whatever is necessary'
              body: formData,
            }
          );
          if (res.ok) {

            const parsedLinkList = linkList.map((link) => ({
              related_exhibit_id: link.uid,
              related_exhibit_title: link.name,
            }));

            console.log("Parsed Link List:", parsedLinkList);
            setIsLinksModalVisible(false);

            // Set the submitted link list
            setParsedLinkList(parsedLinkList);
            setdeletelinks(deletelinks);

            const formDatalinks = {
              exhibitsToBeDeleted: deletelinks,
              exhibitsToBeAdded: parsedLinkList,
            }

            // console.log("formDatalinks", formDatalinks);
            console.log("objectdataform", JSON.stringify(formDatalinks));
            const modifylinkres = await fetch(
              `/api/admin/exhibits/add-modified-exhibits/${id}`,
              {
                method: "POST", // or 'PUT' or 'whatever is necessary'
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDatalinks),
              }
            );
            if (modifylinkres.ok) {
              //console.log('Thrid API Call to S3 Successful:', parsedLinkList);
              setIsLoading(false);
              toast.success('Form data submitted successfully');
              setFormSubmitted(true);
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
            else {
              const data = await modifylinkres.json();
              setIsLoading(false);
              console.error('Third API Call to DB Failed:', data.message);
              toast.error('Failed to insert related exhibits');
            }

          }
          else {
            const data = await res.json();
            setIsLoading(false);
            console.error('Call to s3 failed :', data.message);
            toast.error(data.message);
          }
        }
        else {
          const data = await response.json();
          setIsLoading(false);
          console.error('First API Call Failed:', data.message);

          if (data.message.includes('Duplicate entry')) {
            const errors = {};
            errors.asset_number = 'Duplicate entries not allowed.';
            setFormErrors(errors);
            // toast.error('Duplicate entries in Asset Number.', { duration: 1000 });
          }
          else {
            console.log(data.message)
            toast.error('Failed to submit form data.');
          }
        }

      } catch (error) {
        console.log('Failed to submit form data')
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
    marginTop: "38px",
  };

  const labelStyle = {
    fontSize: "11px",
    color: "#4B4B4B",
  };

  const buttonStyle = {
    fontSize: "14px",
    width: "125px",
    height: "25px",
    marginRight: "20px",
    marginTop: "0px",
    marginBottom: '50px'
  };
  // Define a custom style for the form labels
  const formLabelStyle = {
    fontSize: "12px", // Adjust the font size as needed
    marginTop: "-20px",
  };

  // Define a custom style for the space between form elements
  const formElementSpacing = {
    marginBottom: "-15px", // Adjust the margin-bottom as needed
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
    borderColor: "red",
  };

  const errorMessage = {
    color: "red",
  };

  if (isformLoading) {
    return (
      <div>
        <h1>Loading..</h1>
      </div>); // Render a loading indicator
  }

  return (
    <Container className="EditExhibit">
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
          <h1 style={h1Style}>Edit Exhibit</h1>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4} className="mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="Title" className="mb-3">
                <Form.Label style={formLabelStyle}>
                  Title<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={SubmitData.title}
                  onChange={handleChange}
                  placeholder="Enter Title"
                  style={
                    formErrors.title
                      ? { ...TextInputStyle, ...errorStyle }
                      : TextInputStyle
                  }
                />
                {formErrors.title && (
                  <div style={errorMessage}>{formErrors.title}</div>
                )}
              </Form.Group>
            </Form>
          </Col>

          <Col md={4} className="offset-md-3 mb-3">
            <Form style={formElementSpacing}>
              <Form.Group
                controlId="Asset Number"
                className="mb-3"
                style={{ position: "relative" }}
              >
                <Form.Label style={formLabelStyle}>
                  Asset Number<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="asset_number"
                  value={SubmitData.asset_number}
                  onChange={handleChange}
                  placeholder="Enter Asset number"
                  style={
                    formErrors.asset_number
                      ? { ...TextInputStyle, ...errorStyle }
                      : TextInputStyle
                  }
                />
                {formErrors.asset_number && (
                  <div style={errorMessage}>{formErrors.asset_number}</div>
                )}
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
                  value={SubmitData.location}
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
                  value={SubmitData.room}
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
                  value={SubmitData.location_type}
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
                  value={SubmitData.era}
                  onChange={handleChange}
                  placeholder="Enter the Era"
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
                <Form.Label style={formLabelStyle}>Item Type</Form.Label>
                <Form.Control
                  as="select"
                  type="text"
                  name="category_id"
                  list="categories"
                  value={SubmitData.category}
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
                  value={SubmitData.subcategory}
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
                  value={SubmitData.exhibit_desc}
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
                  value={SubmitData.manufacturer}
                  onChange={handleChange}
                  placeholder="Enter the Manufacturer"
                  style={TextInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <p>Attachments</p>
            <Modifyfiles
              files={fileList}
              setFiles={handleupdatedfiles}
              deletefiles={deletefiles}
              setdeletefiles={setdeletefiles}
              formSubmitted={formSubmitted}
              id={id}
              resetFormSubmitted={() => setFormSubmitted(false)}
              nOK={handleOk}
              nCancel={handleCancel}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <p>Related Exhibits </p>
            <Modifylinks
              links={linkList}
              setLinks={handleupdatedlinks}
              link_id={link_id}
              deletelinks={deletelinks}
              setdeletelinks={handledeletelinks}
              visible={true}
              onSubmit={handleLinkSubmit}
              onCancel={handleLinksCancel}
            />
          </Col>
        </Row>


        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-end" style={rightButtonContainerStyle}>
              <button
                className="float-end"
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "8px 16px",
                  fontSize: "12px",
                  width: "100px",
                  height: "25px",
                  marginRight: "20px",
                  marginTop: "-1px",
                  marginBottom: '50px',
                  outline: "1px solid black",
                }}
                onClick={handleCancelClick}
              >
                Cancel
              </button>

              <button className="float-end" style={buttonStyle}>
                Submit
              </button>
            </div>
          </Col>
        </Row>
      </Form>

      <Toaster />

    </Container>
  );
};

export default EditExhibitScreen;