import { useMutation, useQueryClient, useQuery } from "react-query";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  InputGroup,
  Form,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import { FaSearch, FaFilter } from "react-icons/fa";
import styled from "styled-components";
import customStyles from "../utils/tableStyles";
import columns from "../utils/tableColumns";

const RecycleBin = () => {
  const [toggleCleared, setToggleCleared] = React.useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const queryClient = useQueryClient();

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
    const selectedKeys = selectedRows.map((row) => row.exhibit_id);

    if (selectedKeys.length === 0) {
      toast.error("You need to select at least 1 exhibit to undo");
      return;
    }

    try {
      await undoDeleteMutation.mutateAsync(selectedKeys);

      setSelectedRows((currentSelectedRows) =>
        currentSelectedRows.filter(
          (row) => !selectedKeys.includes(row.exhibit_id)
        )
      );
      setToggleCleared(!toggleCleared);
      toast.success("Exhibits Restored successfully");
    } catch (error) {
      console.error("Error undoing exhibits:", error);
    }
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
    // console.log(state.selectedRows);
    setSelectedRows(state.selectedRows);
    // console.log(state.selectedRows);
  }, []);

  if (isError) return <h1>{error.message}</h1>;

  if (isLoading) return <h1>Loading...</h1>;

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
      <div className="exhibits-list-wrapper recycle-bin-wrapper">
        <p className="page-heading"> Recycle Bin</p>
        <Navbar expand="sm" collapseOnSelect className="table-header">
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
            <button onClick={handleUndoDelete} className="add-exhibit-button">
              Restore Exhibits
            </button>
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

export default RecycleBin;
