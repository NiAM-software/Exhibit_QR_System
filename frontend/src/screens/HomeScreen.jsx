import { useQuery } from "react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("Category"); 
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
    }
  );
  
  if (isError) return <h1>{error.message}</h1>;

  // if (isLoading) return <h1>Loading...</h1>;

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

  const handleClear = () => {
    if (filterText) {
      setFilterText("");
    }
  };

  const tableData = data?data
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
      era
    } = exhibit
   
    return {
      title,
      room,
      asset_number,
      category,
      subcategory,
      era
    };
  }):[];

  return (
    <>
      <div className="exhibits-list-wrapper">
        <div className="header">
          <div class="search">
            <FontAwesomeIcon icon={faSearch} className='fa-search'/>
            <input
            type="input"
            className="input"
            placeholder="Search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          </div>
           <div className="header-end">
            <Link to="/add-exhibit"> 
              <button className="btn-primary"> Add exhibit </button>
            </Link>
            <div className="sort">
              <label for="sort-by">Sort by</label>

              <select name="sort-by" id="sort-by" className="dropdown">
                <option value="Category">Category</option>
                <option value="Title">Title</option>
              </select>
            </div>
           </div>
        
        </div>
        <DataTable
        columns={columns}
        data={tableData}
        progressPending={isLoading}
        progressComponent={<h1>Loading..</h1>}
        pagination
        selectableRows
        customStyles={customStyles}
      />
      </div>
      {/* <h1 className="text-xl">Data table</h1> */}
      
    </>
  );

}
export default HomeScreen;




