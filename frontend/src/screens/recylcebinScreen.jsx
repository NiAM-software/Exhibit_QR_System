import { useMutation, useQueryClient, useQuery } from "react-query";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetExhibitsQuery } from "../slices/exhibitApiSlice";
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
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "react-data-table-component";
import { FaSearch, FaFilter } from "react-icons/fa";
import styled from "styled-components";
import CustomModal from "../components/CustomModal";

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

const RecycleBin = () => {
    const navigate = useNavigate();
    const [toggleCleared, setToggleCleared] = React.useState(false);
    //const [tableData, setTableData] = React.useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [show, setShow] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState();
    const [notificationMessage2, setNotificationMessage2] = useState();

    const handleClose = () => {
        setShow(false);
        console.log("click");
    };

    const closeModal = () => {
        closeNotification();
        setNotificationMessage();
    };

    const queryClient = useQueryClient();

    // const deleteMutation = useMutation(
    //     async (selectedKeys) => {
    //         const response = await axios.delete("/api/admin/exhibits", {
    //             data: { ids: selectedKeys },
    //         });
    //         return response.data;
    //     },
    //     {
    //         onSuccess: () => {
    //             queryClient.invalidateQueries("user-data");
    //             setSelectedRows([]);
    //         },
    //     }
    // );

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

    const handleShow = () => setShow(true);
    const closeNotification = () => {
        setShowNotification(false);
    };

    const { data, isLoading, isError, error } = useQuery(
        ["user-data"],
        async () => {
            try {
                const response = await axios.get("/api/admin/exhibits/bin");
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



    if (isError) return <h1>{error.message}</h1>;

    if (isLoading) return <h1>Loading...</h1>;

    const columns = [
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            sortField: "Title",
            id: 2,
        },
        {
            name: "Category",
            selector: (row) => row.category,
            sortable: true,
            // sortFunction: customSortFunction,
            id: 1,
        },
        {
            name: "Subcategory",
            selector: (row) => row.subcategory,
            id: 3,
        },
        {
            name: "Asset Number",
            selector: (row) => row.asset_number,
            id: 4,
        },
        {
            name: "Room",
            selector: (row) => row.room,
            id: 5,
        },
        {
            name: "Era",
            selector: (row) => row.era,
            id: 6,
        },
    ];

    const tableData = data
        ? data
            .filter(
                (exhibit) =>
                    exhibit.title &&
                    exhibit.title.toLowerCase().includes(filterText.toLowerCase())
            )
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
                <h1 className="text-center">Recycle Bin </h1>
                <Navbar expand="sm" collapseOnSelect className="table-header">
                    <Container>
                        <InputGroup>
                            <StyledFormControl
                                placeholder="Search.."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            <InputGroup.Text id="basic-addon1">
                                <FaSearch />
                            </InputGroup.Text>
                        </InputGroup>
                        <button onClick={handleUndoDelete} className="btn-primary-sm">
                            Restore
                        </button>
                        {/* <InputGroup.Text className="filter-icon">
                            <FaFilter />
                        </InputGroup.Text> */}
                        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                <Link to="/AddExhibitScreen">
                                    <button className="btn-primary-sm add-exhibit-btn">
                                        Add New Exhibit{" "}
                                    </button>
                                </Link>
                            </Nav>
                        </Navbar.Collapse> */}
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
                    fixedHeaderScrollHeight="400px"
                />

                {/* {selectedRows.length > 0 && (
                    <ButtonsContainer
                        restoreExhibits={handleUndoDelete}
                    />
                )} */}
                {/* {console.log(notificationMessage)} */}
                {showNotification && (
                    <Modal show={showNotification} onHide={closeNotification}>
                        <Modal.Body>
                            {`Exhibits ${notificationMessage2.join(", ")} have been deleted`}
                        </Modal.Body>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                className="btn-primary-sm"
                                style={{ marginRight: "10px" }}
                                onClick={closeModal}
                            >
                                Confirm
                            </button>
                            <button
                                className="btn-primary-sm"
                                style={{ marginLeft: "10px" }}
                                onClick={handleUndoDelete}
                            >
                                Undo
                            </button>
                        </div>
                        <div style={{ marginTop: "20px" }}>
                            {" "}
                            {/* Add margin below the buttons */}
                            {/* You can add additional content or spacing here */}
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
};
const StyledFormControl = styled(Form.Control)`
  margin: 0px 0;
  height: 32px;
  width: 80px;
  font-size: 13px;
`;
const StyledModalFooter = styled(Modal.Footer)`
  text-decoration: underline;
  color: #add8e6;
  cursor: pointer;
  font-size: 13px;
`;

export default RecycleBin;