const customStyles = {
    rows: {
      style: {
        fontSize: "13px",
        fontFamily: "Arial, sans-serif",
  
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px", // Increased padding for head cells
        paddingRight: "16px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: "#E0E0E0", // Slight grey background for header
        color: "#000", // Dark color for header text
        borderTopWidth: "0", // Remove top border for cleaner look
        borderBottomWidth: "2px", // Emphasize the bottom border
        borderBottomColor: "#ccc", // Light grey border
      },
    },
    cells: {
      style: {
        paddingLeft: "16px", // Increased padding for data cells
        paddingRight: "16px",
        borderBottomWidth: "1px", // Lighten border color
        borderBottomColor: "#e8e8e8", // Light grey border
      },
    },
    headRow: {
      style: {
        minHeight: "56px", // Adjust head row height
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
        borderBottomColor: "#ccc",
      },
      denseStyle: {
        minHeight: "32px",
      },
    },
    pagination: {
      style: {
        borderTopStyle: "none", // Remove top border for pagination
        fontSize: "14px",
  
        color: "#000",
      },
      pageButtonsStyle: {
        borderRadius: "50%", // Round the pagination buttons
        height: "40px", // Increase the size for better clickability
        width: "40px",
        padding: "8px",
        margin: "0px 8px",
        cursor: "pointer",
        transition: "0.4s", // Smooth transition
        color: "#007bff", // Use brand color for buttons
        "&:disabled": {
          cursor: "not-allowed",
          color: "#ccc",
        },
        "&:hover:not(:disabled)": {
          backgroundColor: "#e8e8e8", // Hover background color
        },
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

  export default customStyles