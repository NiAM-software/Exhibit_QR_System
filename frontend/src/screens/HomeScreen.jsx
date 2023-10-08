import { useQuery } from "react-query";
import axios from "axios";
import DataTable from "react-data-table-component";

const HomeScreen = () => {
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


  const tableData = data?data.map((exhibit) => {;
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
      {/* <h1 className="text-xl">Data table</h1> */}
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={isLoading}
        progressComponent={<h1>My Custom Component</h1>}
        pagination
        selectableRows
      />
    </>
  );

}
export default HomeScreen;




