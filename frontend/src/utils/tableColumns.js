const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      sortField: "Title",
      id: 2,
    },
    {
      name: "Item Type",
      selector: (row) => row.category,
      sortable: true,
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

  export default columns;