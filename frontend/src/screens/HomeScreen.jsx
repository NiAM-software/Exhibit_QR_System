import { useMutation, useQueryClient, useQuery } from "react-query";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetExhibitsQuery } from "../slices/exhibitApiSlice";
import columns from "../utils/tableColumns";
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
  Button,
} from "react-bootstrap";
import {
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoAdd,
} from "react-icons/io5";

import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "react-data-table-component";
import { FaSearch, FaFilter } from "react-icons/fa";
import styled from "styled-components";
import CustomModal from "../components/CustomModal";
import ButtonsContainer from "../components/ButtonsContainer";
import customStyles from "../utils/tableStyles";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [toggleCleared, setToggleCleared] = React.useState(false);
  //const [tableData, setTableData] = React.useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [show, setShow] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState();
  const [notificationMessage2, setNotificationMessage2] = useState();
  const [csvFile, setCsvFile] = useState();

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    handleUpload();
  };

  const handleClose = () => {
    setShow(false);
    console.log("click");
  };

  const closeModal = () => {
    closeNotification();
    setNotificationMessage();
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    async (selectedKeys) => {
      const response = await axios.delete("/api/admin/exhibits", {
        data: { ids: selectedKeys },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-data");
        setSelectedRows([]);
      },
    }
  );

  const undoDeleteMutation = useMutation(
    async (ids) => {
      const response = await axios.put("/api/admin/exhibits/undo-delete", {
        data: { ids: ids },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-data");
      },
    }
  );

  const handleUndoDelete = async () => {
    const ids = notificationMessage;
    console.log(typeof ids);
    console.log(ids);
    try {
      await undoDeleteMutation.mutateAsync(ids);
      setToggleCleared(!toggleCleared); // Toggle the clear state
      closeModal();
    } catch (error) {
      console.log(error.message);
      console.error("Error performing undo op:", error);
      // Handle error if needed
    }
  };

  const deleteExhibits = async () => {
    const selectedKeys = selectedRows.map((row) => row.exhibit_id);
    const selectedTitles = selectedRows.map((row) => row.title);
    if (selectedKeys.length === 0) {
      toast.error("You need to select at least 1 exhibit");
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedKeys);
      setSelectedRows((currentSelectedRows) =>
        currentSelectedRows.filter(
          (row) => !selectedKeys.includes(row.exhibit_id)
        )
      );
      setShowNotification(true);
      setNotificationMessage(selectedKeys);
      setNotificationMessage2(selectedTitles);
      setToggleCleared(!toggleCleared); // Toggle the clear state
    } catch (error) {
      console.error("Error deleting exhibits:", error);
      // Handle error if needed
    }
  };

  const handleShow = () => setShow(true);
  const closeNotification = () => {
    setShowNotification(false);
  };

  const { data, isLoading, isError, error } = useQuery(
    ["user-data"],
    async () => {
      try {
        const response = await axios.get("/api/admin/exhibits");
        console.log("Data fetched successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    {
      select: (data) => data.exhibits,
    }
  );

  const handleSelectedRowsChange = React.useCallback((state) => {
    console.log(state.selectedRows);
    setSelectedRows(state.selectedRows);
    console.log(state.selectedRows);
  }, []);

  const editExhibits = () => {
    const selectedRowId = selectedRows.map((row) => row.exhibit_id);
    if (selectedRows.length > 1) {
      toast.error("Multiple exhibits can't be selected");
    } else if (selectedRows.length == 0) {
      toast.error("You need to select at least 1 exhibit");
    } else if (selectedRowId) {
      const editUrl = `/EditExhibitScreen/${selectedRowId}`;
      console.log(selectedRowId);
      navigate(editUrl);
    } else {
      console.error("No valid ID provided for editing.");
    }
  };

  //@import csv
  const handleUpload = () => {
    const formData = new FormData();
    formData.append("name", "FILENAME");
    formData.append("file", csvFile);

    const url = "/api/admin/exhibits/import-csv";

    axios({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData, // Use 'data' instead of 'body'
    })
      .then((res) => {
        console.log(res);
        if (res.status == 201) {
          toast.success('Data loaded Successfully');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          console.log(res);
          toast.error('Error uploading data. Please check the guidelines.');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err.response);
        toast.error('Error uploading data: ' + err.response.data.error);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
  };

  // @export csv
  const generateCSV = async () => {
    try {
      const response = await fetch("/api/admin/exhibits/export", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "exhibits.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("in catch block");
      console.error(error.message);
      console.error("Error exporting CSV:", error.message);
      toast.error("Error exporting CSV")
    }
  };

  const showPreview = async () => {
    const selectedRowId = selectedRows.map((row) => row.exhibit_id);
    console.log("selectedRowId:", selectedRowId);
    if (selectedRows.length > 1) {
      toast.error("Multiple exhibits can't be selected");
    } else if (selectedRows.length == 0) {
      toast.error("You need to select at least 1 exhibit");
    } else if (selectedRowId) {
      const selectedRow = selectedRows[0];
      const exhibitId = selectedRow.exhibit_id;
      navigate(`/ProductScreen/${exhibitId}`);
    } else {
      console.error("No valid ID provided for editing.");
    }
  };

  const showQRHandler = () => {
    if (selectedRows.length > 1) {
      toast.error("Multiple exhibits can't be selected");
    } else {
      handleShow();
    }
  };

  if (isError) return <h1>{error.message}</h1>;

  // if (isLoading) return <h1>Loading...</h1>;

  const tableData = data
    ? data
      .filter((exhibit) => {
        const valuesToSearch = [
          exhibit.title,
          exhibit.room,
          exhibit.asset_number,
          exhibit.category,
          exhibit.subcategory,
          exhibit.era,
          exhibit.exhibit_id,
        ];

        return valuesToSearch
          .map((value) => String(value)) // Convert each value to a string
          .filter(Boolean) // Filter out undefined or falsy values
          .some((value) =>
            value.toLowerCase().includes(filterText.toLowerCase())
          );
      })
      .map((exhibit) => {
        const {
          title,
          room,
          asset_number,
          category,
          subcategory,
          era,
          exhibit_id,
        } = exhibit;

        return {
          title,
          room,
          asset_number,
          category,
          subcategory,
          era,
          exhibit_id,
        };
      })
    : [];

  //console.log(tableData);

  return (
    <>
      <CustomModal show={show} handleClose={handleClose} data={selectedRows} />

      <div className="exhibits-list-wrapper">
        <p className="page-heading">Exhibit inventory </p>
        <Navbar expand="sm" collapseOnSelect className="table-header-2">
          <Container>
            <InputGroup>
              <StyledFormControl
                placeholder="Search.."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ width: "150px" }}
              />
              <InputGroup.Text id="basic-addon1">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <button className="csv-button" onClick={generateCSV}>
                  <IoCloudDownloadOutline style={{ fontSize: "14px" }} />{" "}
                  Download CSV
                </button>

                <>
                  <label for="file-upload" class="csv-button">
                    <IoCloudUploadOutline style={{ fontSize: "14px" }} /> Import
                    CSV
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    name="file"
                    style={{ display: "none" }}
                  // onchange="handleFileChange(event)"
                  />
                </>
                <Link to="/AddExhibitScreen">
                  <button className="add-exhibit-button">
                    <IoAdd style={{ fontSize: "14px" }} />
                    New Exhibit
                  </button>
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <DataTable
          columns={columns}
          data={tableData}
          keyField="exhibit_id"
          selectableRows
          onSelectedRowsChange={handleSelectedRowsChange}
          clearSelectedRows={toggleCleared}
          progressPending={isLoading}
          progressComponent={<h1>Loading..</h1>}
          pagination
          customStyles={customStyles}
          fixedHeader
          fixedHeaderScrollHeight="50%"
        />

        {selectedRows.length > 0 && (
          <ButtonsContainer
            showPreview={showPreview}
            showQRHandler={showQRHandler}
            editExhibits={editExhibits}
            deleteExhibits={deleteExhibits}
          />
        )}
        {/* {console.log(notificationMessage)} */}
        {showNotification && (
          <Modal
            show={showNotification}
            onHide={closeNotification}
            centered
            className="confirm-delete-modal"
          >
            <Modal.Body style={{ textAlign: "center" }}>
              {`Exhibits ${notificationMessage2.join(", ")} have been deleted`}
            </Modal.Body>
            <Modal.Footer
              style={{ borderTop: "none", justifyContent: "center" }}
            >
              <button className="confirm-delete-btn" onClick={closeModal}>
                Confirm
              </button>
              <button className="undo-delete-btn" onClick={handleUndoDelete}>
                Undo
              </button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </>
  );
};
const StyledFormControl = styled(Form.Control)`
  margin: 0px 0;
  height: 36px !important;
  width: 80px;
  font-size: 13px;
`;
const StyledModalFooter = styled(Modal.Footer)`
  text-decoration: underline;
  color: #add8e6;
  cursor: pointer;
  font-size: 13px;
`;

export default HomeScreen;

// undo -> once successful , display toast msg
// register button on login screen
