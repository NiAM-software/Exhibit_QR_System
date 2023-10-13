import { useMutation, useQueryClient, useQuery } from "react-query";
import React, { useState } from "react";


import {Navbar,  Nav, Container, Badge, NavDropdown, InputGroup, Form, Row, Col} from 'react-bootstrap'
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "react-data-table-component";
import { FaSearch,  FaFilter } from 'react-icons/fa';
import styled from 'styled-components';
import CustomModal from '../components/CustomModal'
import Notification from "../components/Notification";

const customStyles = {
  rows: {
    style: {
      minHeight: '50px', // override the row height
      fontSize: '12px',
      fontFamily: 'arial',
    },
  },
  headCells: {
    style: {
      paddingLeft: '8px', // override the cell padding for head cells
      paddingRight: '8px',
    },
  },
  cells: {
    style: {
      paddingLeft: '8px', // override the cell padding for data cells
      paddingRight: '8px',
    },
  },
  headRow: {
    style: {
      minHeight: '52px',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      fontSize: '14px',
      fontFamily: 'arial',
    },
    denseStyle: {
      minHeight: '32px',
    },
  },
  tableWrapper: {
    style: {
      fontSize: '18px',
      fontFamily: 'arial',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add box shadow here
      margin: 'auto',
      marginBottom: '20px',
    },
  },
};


const HomeScreen = () => { 
  const [toggleCleared, setToggleCleared] = React.useState(false);
	//const [tableData, setTableData] = React.useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [show, setShow] = useState(false);
  const [showNotification, setShowNotification] = useState();
  const [notificationMessage, setNotificationMessage] = useState();

  const handleClose = () => {
    setShow(false);
    console.log('click');
  }
  
  const queryClient = useQueryClient(); 

  const deleteMutation = useMutation(
    async (selectedKeys) => {
      const response = await axios.delete("/api/exhibits", {
        data: { ids: selectedKeys },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-data");
      },
    }
  );

  const deleteExhibits = async () => {
    const selectedKeys = selectedRows.map(row => row.exhibit_id);
    if (selectedKeys.length === 0) {
      toast.error("You need to select at least 1 exhibit");
      return;
    }
  
    try {
      await deleteMutation.mutateAsync(selectedKeys);
      setSelectedRows(currentSelectedRows => currentSelectedRows.filter(row => !selectedKeys.includes(row.exhibit_id)));
      setShowNotification(true);
      setNotificationMessage(selectedKeys);
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
        const response = await axios.get("/api/exhibits");
        console.log("Data fetched successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error; 
      }
    },
    {
      select: (data) => data.exhibits, 
      
    },
    
  );
  
  const handleSelectedRowsChange = React.useCallback(state => {
    console.log(state.selectedRows);
    setSelectedRows(state.selectedRows);
    console.log(state.selectedRows); 
  }, []);

  

  
  const showQRHandler = () => {
    if(selectedRows.length>1){
      toast.error("Multiple exhibits can't be selected");
    }
    else{
      handleShow()
    }
  };


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


  const tableData  = data?data
  .filter(
    (exhibit) =>
      exhibit.title && exhibit.title.toLowerCase().includes(filterText.toLowerCase())
  )
  .map((exhibit) => {;
    const{ 
      title,
      room,
      asset_number,
      category,
      subcategory,
      era, 
      exhibit_id
    } = exhibit
   
    return {
      title,
      room,
      asset_number,
      category,
      subcategory,
      era,
      exhibit_id
    };
  }):[];
 

  //console.log(tableData);

  return (
    <>
    <CustomModal show={show} handleClose={handleClose} data={selectedRows}/>
   
      <div className="exhibits-list-wrapper">
        <h1 className='text-center'>Exhibit inventory </h1>
        <Navbar expand='sm' collapseOnSelect className="table-header">
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
             <InputGroup.Text className="filter-icon">
              <FaFilter />
            </InputGroup.Text>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
            <button className="btn-primary-sm add-exhibit-btn">add exhibit </button>      
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
        fixedHeaderScrollHeight="400px"
      />
      

        {selectedRows.length > 0 &&  (
          <Container className="btn-menu d-flex justify-content-end">
          <Row>
            <Col xs={2} md={3}>
              <button>Preview</button>
            </Col>
            <Col xs={2} md={3}>
              <button onClick={showQRHandler}>Show QR</button>
            </Col>
            <Col xs={2} md={3}>
              <button>Edit</button>
            </Col>
            <Col xs={2} md={3}>
              <button onClick={deleteExhibits}>Delete</button>
            </Col>
          </Row>
          </Container>
        )}
        {
          showNotification && (
            <div> helllo</div>
          )
        }
       {showNotification && (
        <Notification message={notificationMessage} onClose={closeNotification} />
      )}
        
      </div>
    </>
  );

}
const StyledFormControl = styled(Form.Control)`
  margin: 0px 0;
  height:32px;
  width:80px;
  font-size : 13px;
`;
export default HomeScreen;




