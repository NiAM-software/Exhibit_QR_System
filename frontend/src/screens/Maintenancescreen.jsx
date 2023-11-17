import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch, FaFilter } from "react-icons/fa";
import styled from "styled-components";
import {
  Navbar,
  Nav,
  Container,
  Badge,
  NavDropdown,
  InputGroup,
  Form,
  Row,
  Col,
  Modal,
} from "react-bootstrap";

const TextInputStyle = {
  fontSize: '12px', // Adjust the font size as needed
  height: '35px', // Adjust the height as needed
};

const errorStyle = {
  borderColor: 'red',
};

const errorMessage = {
  color: 'red',
};

const customStyles = {
  rows: {
    style: {
      minHeight: "50px", // override the row height
      fontSize: "12px",
      fontFamily: "arial",
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px", // override the cell padding for head cells
      paddingRight: "8px",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px", // override the cell padding for data cells
      paddingRight: "8px",
    },
  },
  headRow: {
    style: {
      minHeight: "52px",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      fontSize: "14px",
      fontFamily: "arial",
    },
    denseStyle: {
      minHeight: "32px",
    },
  },
  tableWrapper: {
    style: {
      fontSize: "18px",
      fontFamily: "arial",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Add box shadow here
      margin: "auto",
      marginBottom: "20px",
    },
  },
};

const Maintenancescreen = () => {

  const [formErrors, setFormErrors] = useState("");
  const [activeTab, setActiveTab] = useState("Categories");
  const [_data, setData] = useState([]); // Data for the DataTable
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showeditModal, setShowEditModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [editText, setEditText] = useState("");
  const [toggleCleared, setToggleCleared] = React.useState(false);


  const fetchDataForActiveTab = async () => {
    try {
      const fetch_response = await axios.get("/api/admin/exhibits/maintenance");

      if (activeTab === "Categories") {
        setData(fetch_response.data.categories);
      } else if (activeTab === "Locations") {
        setData(fetch_response.data.locations);
      } else if (activeTab === "LocationTypes") {
        setData(fetch_response.data.locationTypes);
      } else if (activeTab === "Rooms") {
        setData(fetch_response.data.rooms);
      }
    }
    catch (error) {
      console.error("Error while fetching maintenance fields:", error);
    }

  };

  useEffect(() => {
    // Fetch data for the DataTable based on the activeTab
    fetchDataForActiveTab();
  }, [activeTab]);

  const validateForm = () => {
    const errors = {};
    // if (!editCategory || !newCategory) {
    //     errors.category = 'Category cannot be null';
    // }
    //   if (!editlocation || !newlocation) {
    //     errors.location = 'location cannot be null';
    //   }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleSelectedRowsChange = React.useCallback((state) => {
    console.log(state.selectedRows);
    setSelectedRows(state.selectedRows);
    console.log(state.selectedRows);
  }, []);

  const columns = [
    {
      name: "Id",
      selector: (row) => row.id,
      sortable: true,
      id: 2,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      id: 1,
    },
  ];
  const tableData = _data
    ? _data
      .filter(
        (field) =>
          field.name &&
          field.name.toLowerCase().includes(filterText.toLowerCase())
      )
      .map((field) => {
        const {
          id,
          name,
        } = field;

        return {
          id,
          name,
        };
      })
    : [];

  const handleModal = () => {
    setShowModal(!showModal);
    setInputText("");
    setFormErrors("");
  };
  const handleEditModal = () => {
    setShowEditModal(!showeditModal);
    //setInputText("");
    setFormErrors("");
  };

  const handleEditButtonClick = () => {
    if (selectedRows.length === 1) {
      const selectedRowData = selectedRows[0]; // Assuming the selectedRows is an array of objects
      setEditText(selectedRowData.name); // Assuming 'name' is the property you want to edit
      setShowEditModal(true);
    } else {
      toast.error("Multiple items can't be selected");
    }
  };

  const handleOkClick = async (e) => {
    e.preventDefault();
    //setFormErrors("");
    let hasErrors = false;
    if (inputText) {
      //const errors="";
      console.log("formErrors", formErrors);
      const errors = 'Duplicate entries not allowed.';
      if (activeTab === "Categories") {
        console.log(activeTab.toLowerCase());
        const postresponse = await fetch(`/api/admin/exhibits/maintenance/category`, {
          method: 'POST', // or 'PUT' or 'whatever is necessary'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: inputText }),
        });

        if (postresponse.ok) {
          const postdata = await postresponse.json();
          console.log("Category is added successfully:", postdata.message);
          toast.success('New category is added successfully');
          const newItem = {
            id: postdata.id,
            name: inputText,
          };
          setData([...tableData, newItem]);
          setInputText("");
          setFormErrors("");
        }
        else {
          const data = await postresponse.json();
          console.error('new category addition failed:', data.message);
          if (data.message.includes('Duplicate entry')) {
            //const errors='Duplicate entries not allowed.';
            setFormErrors(errors);
            hasErrors = true;
          }
          else {
            toast.error('Failed to add new category');
          }
          setInputText("");
        }


      } else if (activeTab === "Locations") {
        const postresponse = await fetch(`/api/admin/exhibits/maintenance/location`, {
          method: 'POST', // or 'PUT' or 'whatever is necessary'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location: inputText }),
        });

        if (postresponse.ok) {
          const postdata = await postresponse.json();
          console.log("Location is added successfully:", postdata.message);
          toast.success('New Location is added successfully');
          const newItem = {
            id: postdata.id,
            name: inputText,
          };
          setData([...tableData, newItem]);
          setInputText("");
        }
        else {
          const data = await postresponse.json();
          console.error('new location addition failed:', data.message);
          if (data.message.includes('Duplicate entry')) {
            //const errors = {};
            //const errors='Duplicate entries not allowed.';
            setFormErrors(errors);
            hasErrors = true;
            //toast.error('Category already exists.', { duration: 1000 });
          }
          else {
            toast.error('Failed to add new location');
          }
          setInputText("");
        }

      } else if (activeTab === "LocationTypes") {
        const postresponse = await fetch(`/api/admin/exhibits/maintenance/location_type`, {
          method: 'POST', // or 'PUT' or 'whatever is necessary'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location_type: inputText }),
        });

        if (postresponse.ok) {
          const postdata = await postresponse.json();
          console.log("Locationtype is added successfully:", postdata.message);
          toast.success('New Locationtype is added successfully');
          const newItem = {
            id: postdata.id,
            name: inputText,
          };
          setData([...tableData, newItem]);
          setInputText("");
        }
        else {
          const data = await postresponse.json();
          console.error('new Locationtype addition failed:', data.message);
          if (data.message.includes('Duplicate entry')) {
            // const errors = {};
            // errors.locationtype='Duplicate entries not allowed.';
            setFormErrors(errors);
            hasErrors = true;
            //toast.error('Category already exists.', { duration: 1000 });
          }
          else {
            toast.error('Failed to add new Locationtype');
          }
          setInputText("");
        }

      } else if (activeTab === "Rooms") {
        const postresponse = await fetch(`/api/admin/exhibits/maintenance/room`, {
          method: 'POST', // or 'PUT' or 'whatever is necessary'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room: inputText }),
        });

        if (postresponse.ok) {
          const postdata = await postresponse.json();
          console.log("Room is added successfully:", postdata.message);
          toast.success('New room is added successfully');
          const newItem = {
            id: postdata.id,
            name: inputText,
          };
          setData([...tableData, newItem]);
          setInputText("");
        }
        else {
          const data = await postresponse.json();
          console.error('new room addition failed:', data.message);
          if (data.message.includes('Duplicate entry')) {
            // const errors = {};
            // errors.room='Duplicate entries not allowed.';
            setFormErrors(errors);
            hasErrors = true;
            //toast.error('Category already exists.', { duration: 1000 });
          }
          else {
            toast.error('Failed to add new room');
          }
          setInputText("");
        }
      }
    }
    if (!hasErrors) {
      setShowModal(false);
    }

  };

  const handleEditModalOkClick = async (e) => {
    e.preventDefault();
    setFormErrors("");
    let errorscheck = false;
    let errors = "";
    if (editText) {
      const selectedRowData = selectedRows[0];
      const selecteddata = selectedRowData.name;
      const selectedId = selectedRowData.id;
      if (activeTab === "Categories") {
        if (selecteddata && editText && (selecteddata != editText)) {
          if (selectedId) {
            // Send a PUT request to update the category
            const putresponse = await fetch(`/api/admin/exhibits/maintenance/category`, {
              method: 'PUT', // or 'PUT' or 'whatever is necessary'
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ category: editText, id: selectedId }),
            });

            if (putresponse.ok) {
              const putdata = await putresponse.json();
              toast.success('Successfully updated category');
              //console.log("putdata",putdata);
              const updatedtabledata = tableData.map((item) =>
                item.id === selectedId
                  ? { ...item, name: editText }
                  : item
              );
              //setCategories(updatedtabledata);
              setData(updatedtabledata);
              console.log("updatedtabledata", updatedtabledata);
              setSelectedRows([]);
              setToggleCleared(!toggleCleared);
              setEditText("");
              setFormErrors("");
            }
            else {
              const data = await putresponse.json();
              console.error("Couldn't update the category", data.message);
              toast.error('Failed to edit the category');
              setSelectedRows([]);
              setEditText("");
            }
          }
        }
        else if (selecteddata === editText) {
          errors = 'Data already exists';
          setFormErrors(errors);
          errorscheck = true;
        }
      } else if (activeTab === "Locations") {
        if (selecteddata && editText && (selecteddata != editText)) {
          if (selectedId) {
            // Send a PUT request to update the category
            const putresponse = await fetch(`/api/admin/exhibits/maintenance/location`, {
              method: 'PUT', // or 'PUT' or 'whatever is necessary'
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ location: editText, id: selectedId }),
            });

            if (putresponse.ok) {
              const putdata = await putresponse.json();
              toast.success('Successfully updated location');
              //console.log("putdata",putdata);
              const updatedtabledata = tableData.map((item) =>
                item.id === selectedId
                  ? { ...item, name: editText }
                  : item
              );
              //setCategories(updatedtabledata);
              setData(updatedtabledata);
              console.log("updatedtabledata", updatedtabledata);
              setSelectedRows([]);
              setToggleCleared(!toggleCleared);
              setEditText("");
              setFormErrors("");
            }
            else {
              const data = await putresponse.json();
              console.error("Couldn't update the location", data.message);
              toast.error('Failed to edit the location');
              setSelectedRows([]);
              setEditText("");
            }
          }
        }
        else if (selecteddata === editText) {
          errors = 'Data already exists';
          setFormErrors(errors);
          errorscheck = true;
        }
      } else if (activeTab === "LocationTypes") {
        if (selecteddata && editText && (selecteddata != editText)) {
          if (selectedId) {
            // Send a PUT request to update the category
            const putresponse = await fetch(`/api/admin/exhibits/maintenance/location_type`, {
              method: 'PUT', // or 'PUT' or 'whatever is necessary'
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ location_type: editText, id: selectedId }),
            });

            if (putresponse.ok) {
              const putdata = await putresponse.json();
              toast.success('Successfully updated location_type');
              //console.log("putdata",putdata);
              const updatedtabledata = tableData.map((item) =>
                item.id === selectedId
                  ? { ...item, name: editText }
                  : item
              );
              //setCategories(updatedtabledata);
              setData(updatedtabledata);
              console.log("updatedtabledata", updatedtabledata);
              setSelectedRows([]);
              setToggleCleared(!toggleCleared);
              setEditText("");
              setFormErrors("");
            }
            else {
              const data = await putresponse.json();
              console.error("Couldn't update the location_type", data.message);
              toast.error('Failed to edit the location_type');
              setSelectedRows([]);
              setEditText("");
            }
          }
        }
        else if (selecteddata === editText) {
          errors = 'Data already exists';
          setFormErrors(errors);
          errorscheck = true;
        }
      } else if (activeTab === "Rooms") {
        if (selecteddata && editText && (selecteddata != editText)) {
          if (selectedId) {
            // Send a PUT request to update the category
            const putresponse = await fetch(`/api/admin/exhibits/maintenance/room`, {
              method: 'PUT', // or 'PUT' or 'whatever is necessary'
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ room: editText, id: selectedId }),
            });

            if (putresponse.ok) {
              const putdata = await putresponse.json();
              toast.success('Successfully updated room');
              //console.log("putdata",putdata);
              const updatedtabledata = tableData.map((item) =>
                item.id === selectedId
                  ? { ...item, name: editText }
                  : item
              );
              //setCategories(updatedtabledata);
              setData(updatedtabledata);
              console.log("updatedtabledata", updatedtabledata);
              setSelectedRows([]);
              setToggleCleared(!toggleCleared);
              setEditText("");
              setFormErrors("");
            }
            else {
              const data = await putresponse.json();
              console.error("Couldn't update the room", data.message);
              toast.error('Failed to edit the room');
              setSelectedRows([]);
              setEditText("");
            }
          }
        }
        else if (selecteddata === editText) {
          errors = 'Data already exists';
          setFormErrors(errors);
          errorscheck = true;
        }
      }
    } else if (!editText) {
      errors = 'Value cannot be null';
      setFormErrors(errors);
      errorscheck = true;
    }
    if (!errorscheck) {
      setShowEditModal(false);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (selectedRows.length > 0) {
      const selectedIds = selectedRows.map((row) => row.id);

      try {
        let endpoint = "";
        switch (activeTab) {
          case "Categories":
            endpoint = '/api/admin/exhibits/maintenance/category';
            break;
          case "Locations":
            endpoint = '/api/admin/exhibits/maintenance/location';
            break;
          case "LocationTypes":
            endpoint = '/api/admin/exhibits/maintenance/location_type';
            break;
          case "Rooms":
            endpoint = '/api/admin/exhibits/maintenance/room';
            break;
          default:
            // Handle default case if needed
            break;
        }

        // const deleteResponse = await axios.delete(endpoint, {
        //   data: { ids: selectedIds },
        // });
        const deleteResponse = await fetch(endpoint, {
          method: 'DELETE', // or 'PUT' or 'whatever is necessary'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (deleteResponse.ok) {
          // Handle successful deletion
          toast.success('Selected items deleted successfully');
          fetchDataForActiveTab(); // Refresh the data after deletion
        } else {
          const data = await deleteResponse.json();
          console.error('Failed to delete items:', data.message);
          toast.error('Failed to delete selected items');
        }
      } catch (error) {
        console.error('Error during delete operation:', error);
        toast.error('Error during delete operation');
      }
    } else {
      toast.error('No items selected for deletion');
    }
  };

  return (
    <div className="exhibits-list-wrapper">
      <h1 className="text-center">Maintenance</h1>
      <div style={{ display: "flex" }}>
        {/* <button className="btn-primary-sm" onClick={() => handleTabClick("Categories")}>Categories</button>
        <span style={{ marginLeft: "10px" }}></span>
        <button className="btn-primary-sm" onClick={() => handleTabClick("Locations")}>Locations</button>
        <span style={{ marginLeft: "10px" }}></span>
        <button className="btn-primary-sm" onClick={() => handleTabClick("LocationTypes")}>Location Types</button>
        <span style={{ marginLeft: "10px" }}></span>
        <button className="btn-primary-sm" onClick={() => handleTabClick("Rooms")}>Rooms</button> */}
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link
              eventKey="Categories"
              active={activeTab === "Categories"}
              onClick={() => handleTabClick("Categories")}
            >
              Categories
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="Locations"
              active={activeTab === "Locations"}
              onClick={() => handleTabClick("Locations")}
            >
              Locations
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="LocationTypes"
              active={activeTab === "LocationTypes"}
              onClick={() => handleTabClick("LocationTypes")}
            >
              Location Types
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="Rooms"
              active={activeTab === "Rooms"}
              onClick={() => handleTabClick("Rooms")}
            >
              Rooms
            </Nav.Link>
          </Nav.Item>
        </Nav>
        {activeTab && (
          <div style={{ marginLeft: "auto" }}>
            <button className="btn-primary-sm" onClick={handleModal}>Create</button>
            <Modal show={showModal} onHide={handleModal}>
              <Modal.Header closeButton>
                <Modal.Title>Create New Item</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <label>Enter Text:</label>
                  <div>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      style={formErrors ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
                    />
                    {formErrors && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors}</div>)}
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button className="float-end"
                  style={{
                    //backgroundColor: "white",
                    //color: "black",
                    padding: "8px 16px",
                    fontSize: "12px",
                    width: "100px",
                    height: "25px",
                    marginRight: "20px",
                    marginTop: "-1px",
                    //marginBottom: '50px',
                    //outline: "1px solid black",
                  }}

                  onClick={handleOkClick}>
                  OK
                </button>
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
                    //marginBottom: '50px',
                    outline: "1px solid black",
                  }}
                  onClick={handleModal}>
                  Cancel
                </button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
      {activeTab && (
        <div>
          <Navbar expand="sm" className="table-header">
            <Container>
              <Nav className="w-100 justify-content-between">
                {/* <h1>{activeTab}</h1> */}
                <InputGroup style={{ marginLeft: "auto", width: "250px" }}>
                  <StyledFormControl
                    placeholder="Search.."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <InputGroup.Text id="basic-addon1">
                    <FaSearch />
                  </InputGroup.Text>
                </InputGroup>
              </Nav>
            </Container>
          </Navbar>

          <DataTable
            columns={columns}
            data={tableData}
            pagination
            customStyles={customStyles}
            selectableRows
            onSelectedRowsChange={handleSelectedRowsChange}
            clearSelectedRows={toggleCleared}
            fixedHeader
            fixedHeaderScrollHeight="400px"
          />
          {selectedRows.length > 0 && (
            <div style={{ display: "flex", marginTop: "10px" }} className="btn-menu d-flex justify-content-end">
              <button className="btn-primary-sm" onClick={handleEditButtonClick}>Edit</button>
              <Modal show={showeditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Edit Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <label>Edit Text:</label>
                  <div>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={formErrors ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
                    />
                    {formErrors && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors}</div>)}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button className="float-end"
                    style={{
                      //backgroundColor: "white",
                      //color: "black",
                      padding: "8px 16px",
                      fontSize: "12px",
                      width: "100px",
                      height: "25px",
                      marginRight: "20px",
                      marginTop: "-1px",
                      //marginBottom: '50px',
                      //outline: "1px solid black",
                    }}

                    onClick={handleEditModalOkClick}>
                    OK
                  </button>
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
                      //marginBottom: '50px',
                      outline: "1px solid black",
                    }}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditText(""); // Clear the edit text on modal close
                    }}
                  >
                    Cancel
                  </button>
                </Modal.Footer>
              </Modal>
              <button className="btn-primary-sm" style={{ marginLeft: "10px" }} onClick={handleDeleteButtonClick}>
                Delete
              </button>
            </div>)}

        </div>
      )}

    </div>
  );
};

const StyledFormControl = styled(Form.Control)`
  // margin: 0px 0;
  height: 32px;
  width: 80px;
  font-size: 13px;
`;
export default Maintenancescreen;
