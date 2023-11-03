import { Container, Row, Col, Form, Button } from "react-bootstrap";
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

  const fetchCategoriesAndLocationTypes = async () => {
    try {
      const response = await fetch(
        "/api/admin/exhibits/categories-and-location-types"
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setLocationTypes(data.locationTypes);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error while fetching categories:", error);
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

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    room: "",
    location_type: "",
    location: "",
    asset_number: "",
    manufacturer: "",
    era: "",
    exhibit_desc: "",
  });

  useEffect(() => {
    Axios.get(`/api/admin/exhibits/${id}`)
      .then((response) => {
        console.log(response.data)
        setFormData(response.data); // Store data in state for prepopulation
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    fetchCategoriesAndLocationTypes();
    Axios.get("/api/admin/exhibits/next-asset-number")
      .then((newresponse) => {
        const maxAssetNumber = newresponse.data.asset_number;
        const nextAssetNumber = maxAssetNumber + 1;

        // Update the formData with the nextAssetNumber only if response.data.asset_number is null
        if (formData.asset_number === null || formData.asset_number === "") {
          setFormData({
            ...formData,
            asset_number: nextAssetNumber.toString(),
          });
        }

      })
      .catch((error) => {
        console.error("Error fetching next asset number:", error);
        toast.error("Error fetching next asset number");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.title) {
      errors.title = "Title is required";
    }

    if (!formData.asset_number) {
      errors.asset_number = "Asset number is required";
    } else if (isNaN(formData.asset_number)) {
      errors.asset_number = "Asset number must be an integer";
    } else if (formData.asset_number < 0) {
      errors.asset_number = "Asset number cannot be negative";
    }

    if (formData.era !== "" && isNaN(formData.era)) {
      errors.era = "Era must be an integer";
    } else if (formData.era < 0) {
      errors.era = "Era cannot be negative";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {

      try {

        const response = await fetch(`/api/admin/exhibits/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
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
              toast.success('Form data submitted successfully');
              setFormSubmitted(true);
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
            else {
              const data = await modifylinkres.json();
              console.error('Third API Call to DB Failed:', data.message);
              toast.error('Failed to insert related exhibits');
            }

          }
          else {
            const data = await res.json();
            console.error('Call to s3 failed :', data.message);
            toast.error('Failed to update files');
          }
        }
        else {
          const data = await response.json();
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

  return (
    <Container className="EditExhibit">
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
                  value={formData.title}
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
                  value={formData.asset_number}
                  onChange={handleChange}
                  placeholder="Enter Asset number"
                  style={
                    formErrors.asset_number
                      ? { ...TextInputStyle, ...errorStyle }
                      : TextInputStyle
                  }
                />
                {/* {nextAvailableAssetNumber && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      color: "green",
                      fontSize: "12px",
                    }}
                  >
                    Suggested: {nextAvailableAssetNumber}
                  </div>
                )} */}
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
              <Form.Group controlId="locationType" className="mb-3">
                <Form.Label style={formLabelStyle}>LocationType</Form.Label>
                <Form.Control
                  type="text"
                  name="location_type"
                  list="locationTypes"
                  value={formData.location_type}
                  onChange={handleChange}
                  style={TextInputStyle}
                />
                <datalist id="locationTypes">
                  {locationTypes.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </datalist>
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
                  style={
                    formErrors.era
                      ? { ...TextInputStyle, ...errorStyle }
                      : TextInputStyle
                  }
                />
                {formErrors.era && (
                  <div style={errorMessage}>{formErrors.era}</div>
                )}
              </Form.Group>
            </Form>
          </Col>
        </Row>

        <Row>
          <Col md={4} className=" mb-3">
            <Form style={formElementSpacing}>
              <Form.Group controlId="category" className="mb-3">
                <Form.Label style={formLabelStyle}>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  list="categories"
                  value={formData.category}
                  onChange={handleChange}
                  style={TextInputStyle}
                />
                <datalist id="categories">
                  {categories.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </datalist>
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
                  style={TextInputStyle}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>

        {/* <Col md={6} className="mb-4"> 
            <Form style={formElementSpacing}>
                <Form.Group controlId="Description" className="mb-3">
                    <Form.Label style={formLabelStyle}>Description</Form.Label>
                    <Form.Control 
                      type="text" as="textarea" 
                    //   placeholder="Enter Description"
                      name="exhibit_desc"
                      value={formData.exhibit_desc}
                      onChange={handleChange}
                      style={descriptionInputStyle}/>
                </Form.Group>
            </Form>
          </Col> */}
        <Row>
          <Col md={12}>
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