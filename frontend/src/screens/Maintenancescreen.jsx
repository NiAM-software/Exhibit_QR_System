import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
//import { response } from "express";

const inputContainer = {
  display: "flex",
  alignItems: "center",
  margin: "10px 0",
};

const headingstyle = {
  marginRight: "10px", // Add right margin to the label
  paddingLeft: "20px",
  marginTop: "40px",
};

const labelStyle = {
  marginRight: "10px", // Add right margin to the label
  paddingLeft: "20px",
};

const inputStyle = {
  //flex: 2,
  marginRight: "10px", // Add right margin to the input
  fontSize: '12px', // Adjust the font size as needed
  height: '35px', // Adjust the height as needed
  width:'250px',
};

const buttonStyle = {
  //flex: 1,
  marginLeft: "10px",
  marginTop: "8px",
  fontSize: '12px', // Adjust the font size as needed
  width: "120px",
  height:'35px',
};
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
const Maintenancescreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [locations, setlocations] = useState([]);
  const [selectedlocation, setSelectedlocation] = useState("");
  const [newlocation, setNewlocation] = useState("");
  const [editlocation, setEditlocation] = useState("");

  const [locationtypes, setlocationtypes] = useState([]);
  const [selectedlocationtype, setSelectedlocationtype] = useState("");
  const [newlocationtype, setNewlocationtype] = useState("");
  const [editlocationtype, setEditlocationtype] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [rooms, setrooms] = useState([]);
  const [selectedroom, setSelectedroom] = useState("");
  const [newroom, setNewroom] = useState("");
  const [editroom, setEditroom] = useState("");

  const fetchcategories=async()=>{
    try{
        const fetch_response= await axios.get("/api/admin/exhibits/maintenance");
        //console.log(fetch_response.data);
        setCategories(fetch_response.data.categories);
        setlocations(fetch_response.data.locations);
        setlocationtypes(fetch_response.data.locationTypes);
        setrooms(fetch_response.data.rooms);
    }
    catch(error){
        console.error("Error while fetching maintenance fields:", error);
    }

  };

  useEffect(() => {
    fetchcategories();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!editCategory || !newCategory) {
        errors.category = 'Category cannot be null';
    }
      if (!editlocation || !newlocation) {
        errors.location = 'location cannot be null';
      }
  };

  const handleAddCategory = async(e) => {
    e.preventDefault();
    //setFormErrors({});
    const errors = validateForm();
    if (newCategory) {
        //console.log("newCategory:",newCategory);
            const postresponse = await fetch(`/api/admin/exhibits/maintenance/category`, {
                method: 'POST', // or 'PUT' or 'whatever is necessary'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({category:newCategory}),
            });

            if (postresponse.ok){
                const postdata = await postresponse.json();
                console.log("Category is added successfully:",postdata.message);
                toast.success('New category is added successfully');
                setCategories([...categories, { id: postdata.id, name: newCategory }]);
                setNewCategory("");
            }
            else{
                const data = await postresponse.json();
                console.error('new category addition failed:', data.message);
                if (data.message.includes('Duplicate entry')) {
                    const errors = {};
                    errors.category='Duplicate entries not allowed.';
                    setFormErrors(errors);
                    //toast.error('Category already exists.', { duration: 1000 });
                  }
                else{
                toast.error('Failed to add new category');}
                setNewCategory(""); 
            }
    }
  };

  const handleEditCategory = async(e) => {
    e.preventDefault();
    if (selectedCategory && editCategory) {
      // Find the category ID of the selected category
      const selectedCategoryId = categories.find(
        (category) => category.name === selectedCategory
      )?.id;

      if (selectedCategoryId) {
        // Send a PUT request to update the category
        const putresponse = await fetch(`/api/admin/exhibits/maintenance/category`, {
            method: 'PUT', // or 'PUT' or 'whatever is necessary'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({category:editCategory,id:selectedCategoryId}),
        });

        if (putresponse.ok){
            const putdata = await putresponse.json();
            toast.success('Successfully updated category');
            //console.log("putdata",putdata);
            const updatedCategories = categories.map((category) =>
              category.id === selectedCategoryId
                ? { ...category, name:editCategory}
                : category
            );
            setCategories(updatedCategories);
            setSelectedCategory("");
            setEditCategory("");
        }
        else{
            const data = await putresponse.json();
            console.error("Couldn't update the category", data.message);
            toast.error('Failed to edit the category');
            setSelectedCategory("");
            setEditCategory("");
        }
      }
    }
  };

  const handleAddlocation = async(e) => {
    e.preventDefault();
    //setFormErrors({});
    const errors = validateForm();
    if (newlocation) {
        //console.log("newCategory:",newCategory);
            const postresponse = await fetch(`/api/admin/exhibits/maintenance/location`, {
                method: 'POST', // or 'PUT' or 'whatever is necessary'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({location:newlocation}),
            });

            if (postresponse.ok){
                const postdata = await postresponse.json();
                console.log("Location is added successfully:",postdata.message);
                toast.success('New Location is added successfully');
                setlocations([...locations, { id: postdata.id, name: newlocation }]);
                setNewlocation("");
            }
            else{
                const data = await postresponse.json();
                console.error('new location addition failed:', data.message);
                if (data.message.includes('Duplicate entry')) {
                    const errors = {};
                    errors.location='Duplicate entries not allowed.';
                    setFormErrors(errors);
                    //toast.error('Category already exists.', { duration: 1000 });
                  }
                else{
                toast.error('Failed to add new location');}
                setNewlocation(""); 
            }
    }
  };

  const handleEditlocation = async(e) => {
    e.preventDefault();
    if (selectedlocation && editlocation) {
      // Find the category ID of the selected category
      const selectedlocationId = locations.find(
        (location) => location.name === selectedlocation
      )?.id;

      if (selectedlocationId) {
        // Send a PUT request to update the category
        const putresponse = await fetch(`/api/admin/exhibits/maintenance/location`, {
            method: 'PUT', // or 'PUT' or 'whatever is necessary'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({location:editlocation,id:selectedlocationId}),
        });

        if (putresponse.ok){
            const putdata = await putresponse.json();
            toast.success('Successfully updated location');
            //console.log("putdata",putdata);
            const updatedlocations = locations.map((location) =>
            location.id === selectedlocationId
                ? { ...location, name:editlocation}
                : location
            );
            setlocations(updatedlocations);
            setSelectedlocation("");
            setEditlocation("");
        }
        else{
            const data = await putresponse.json();
            console.error("Couldn't update the location", data.message);
            toast.error('Failed to edit the location');
            setSelectedlocation("");
            setEditlocation("");
        }
      }
    }
  };

  const handleAddlocationtype = async(e) => {
    e.preventDefault();
    //setFormErrors({});
    const errors = validateForm();
    if (newlocationtype) {
        //console.log("newCategory:",newCategory);
            const postresponse = await fetch(`/api/admin/exhibits/maintenance/location_type`, {
                method: 'POST', // or 'PUT' or 'whatever is necessary'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({location_type:newlocationtype}),
            });

            if (postresponse.ok){
                const postdata = await postresponse.json();
                console.log("Locationtype is added successfully:",postdata.message);
                toast.success('New Locationtype is added successfully');
                setlocationtypes([...locationtypes, { id: postdata.id, name: newlocationtype }]);
                setNewlocationtype("");
            }
            else{
                const data = await postresponse.json();
                console.error('new Locationtype addition failed:', data.message);
                if (data.message.includes('Duplicate entry')) {
                    const errors = {};
                    errors.locationtype='Duplicate entries not allowed.';
                    setFormErrors(errors);
                    //toast.error('Category already exists.', { duration: 1000 });
                  }
                else{
                toast.error('Failed to add new Locationtype');}
                setNewlocationtype(""); 
            }
    }
  };

  const handleEditlocationtype = async(e) => {
    e.preventDefault();
    if (selectedlocationtype && editlocationtype) {
      // Find the category ID of the selected category
      const selectedlocationtypeId = locationtypes.find(
        (location_type) => location_type.name === selectedlocationtype
      )?.id;

      if (selectedlocationtypeId) {
        // Send a PUT request to update the category
        const putresponse = await fetch(`/api/admin/exhibits/maintenance/location_type`, {
            method: 'PUT', // or 'PUT' or 'whatever is necessary'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({location_type:editlocationtype,id:selectedlocationtypeId}),
        });

        if (putresponse.ok){
            const putdata = await putresponse.json();
            toast.success('Successfully updated locationtype');
            //console.log("putdata",putdata);
            const updatedlocationtypes = locationtypes.map((location_type) =>
            location_type.id === selectedlocationtypeId
                ? { ...location_type, name:editlocationtype}
                : location_type
            );
            setlocationtypes(updatedlocationtypes);
            setSelectedlocationtype("");
            setEditlocationtype("");
        }
        else{
            const data = await putresponse.json();
            console.error("Couldn't update the location_type", data.message);
            toast.error('Failed to edit the location_type');
            setSelectedlocationtype("");
            setEditlocationtype("");
        }
      }
    }
  };

  const handleAddroom = async(e) => {
    e.preventDefault();
    //setFormErrors({});
    const errors = validateForm();
    if (newroom) {
        //console.log("newCategory:",newCategory);
            const postresponse = await fetch(`/api/admin/exhibits/maintenance/room`, {
                method: 'POST', // or 'PUT' or 'whatever is necessary'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({room:newroom}),
            });

            if (postresponse.ok){
                const postdata = await postresponse.json();
                console.log("Room is added successfully:",postdata.message);
                toast.success('New room is added successfully');
                setrooms([...rooms, { id: postdata.id, name: newroom }]);
                setNewroom("");
            }
            else{
                const data = await postresponse.json();
                console.error('new room addition failed:', data.message);
                if (data.message.includes('Duplicate entry')) {
                    const errors = {};
                    errors.room='Duplicate entries not allowed.';
                    setFormErrors(errors);
                    //toast.error('Category already exists.', { duration: 1000 });
                  }
                else{
                toast.error('Failed to add new room');}
                setNewroom(""); 
            }
    }
  };

  const handleEditroom = async(e) => {
    e.preventDefault();
    if (selectedroom && editroom) {
      // Find the category ID of the selected category
      const selectedroomId = rooms.find(
        (room) => room.name === selectedroom
      )?.id;

      if (selectedroomId) {
        // Send a PUT request to update the category
        const putresponse = await fetch(`/api/admin/exhibits/maintenance/room`, {
            method: 'PUT', // or 'PUT' or 'whatever is necessary'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({room:editroom,id:selectedroomId}),
        });

        if (putresponse.ok){
            const putdata = await putresponse.json();
            toast.success('Successfully updated room');
            //console.log("putdata",putdata);
            const updatedrooms = rooms.map((room) =>
            room.id === selectedroomId
                ? { ...room, name:editroom}
                : room
            );
            setrooms(updatedrooms);
            setSelectedroom("");
            setEditroom("");
        }
        else{
            const data = await putresponse.json();
            console.error("Couldn't update the room", data.message);
            toast.error('Failed to edit the room');
            setSelectedroom("");
            setEditroom("");
        }
      }
    }
  };

  return (
    <div>
        <div>
        <h1 style={headingstyle}>Category</h1>

        <div style={inputContainer}>
            <label style={labelStyle}>Add New Category:</label>
            <div>
            <input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={formErrors.category ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
            />
            {formErrors.category && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors.category}</div>)}
            </div>
            <button onClick={handleAddCategory} style={buttonStyle}>
            Add Category
            </button>
        </div>

        <div style={inputContainer}>
            <label style={labelStyle}>Edit Category:</label>
            <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
            >
            <option value="">Select a category to edit</option>
            {categories.map((category) => (
                <option 
                key={category.id} 
                value={category.name}
                data-category-id={category.id}>
                {category.name}
                </option>
            ))}
            </select>
            <input
            type="text"
            placeholder="Edited category name"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
            />
            <button onClick={handleEditCategory} style={buttonStyle}>
            Edit Category
            </button>
        </div>

        </div>
        <div>
        <h1 style={headingstyle}>Locations</h1>
        <div style={inputContainer}>
        <label style={labelStyle}>Add New location:</label>
        <div>
        <input
            type="text"
            placeholder="New location name"
            value={newlocation}
            onChange={(e) => setNewlocation(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={formErrors.location ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
        />
        {formErrors.location && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors.location}</div>)}
        </div>
        <button onClick={handleAddlocation} style={buttonStyle}>
            Add location
        </button>
        </div>

        <div style={inputContainer}>
        <label style={labelStyle}>Edit location:</label>
        <select
            value={selectedlocation}
            onChange={(e) => setSelectedlocation(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        >
            <option value="">Select a location to edit</option>
            {locations.map((location) => (
            <option 
            key={location.id} 
            value={location.name}
            data-location-id={location.id}>
            {location.name}
            </option>
            ))}
        </select>
        <input
            type="text"
            placeholder="Edited location name"
            value={editlocation}
            onChange={(e) => setEditlocation(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        />
        <button onClick={handleEditlocation} style={buttonStyle}>
            Edit location
        </button>
        </div>

        </div>
        <div>
        <h1 style={headingstyle}>LocationTypes</h1>
        <div style={inputContainer}>
        <label style={labelStyle}>Add New locationtype:</label>
        <div>
        <input
            type="text"
            placeholder="New locationtype name"
            value={newlocationtype}
            onChange={(e) => setNewlocationtype(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={formErrors.locationtype ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
        />
        {formErrors.locationtype && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors.locationtype}</div>)}
        </div>
        <button onClick={handleAddlocationtype} style={buttonStyle}>
            Add locationtype
        </button>
        </div>

        <div style={inputContainer}>
        <label style={labelStyle}>Edit locationtype:</label>
        <select
            value={selectedlocationtype}
            onChange={(e) => setSelectedlocationtype(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        >
            <option value="">Select a locationtype to edit</option>
            {locationtypes.map((locationtype) => (
            <option 
            key={locationtype.id} 
            value={locationtype.name}
            data-locationtype-id={locationtype.id}>
            {locationtype.name}
            </option>
            ))}
        </select>
        <input
            type="text"
            placeholder="Edited locationtype name"
            value={editlocationtype}
            onChange={(e) => setEditlocationtype(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        />
        <button onClick={handleEditlocationtype} style={buttonStyle}>
            Edit locationtype
        </button>
        </div>

        </div>
        <div>
        <h1 style={headingstyle}>Rooms</h1>
        <div style={inputContainer}>
        <label style={labelStyle}>Add New room:</label>
        <div>
        <input
            type="text"
            placeholder="New room name"
            value={newroom}
            onChange={(e) => setNewroom(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={formErrors.room ? { ...TextInputStyle, ...errorStyle } : TextInputStyle}
        />
        {formErrors.room && (<div style={{ fontSize: '12px', ...errorMessage }}>{formErrors.room}</div>)}
        </div>
        <button onClick={handleAddroom} style={buttonStyle}>
            Add Room
        </button>
        </div>

        <div style={inputContainer}>
        <label style={labelStyle}>Edit Room:</label>
        <select
            value={selectedroom}
            onChange={(e) => setSelectedroom(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        >
            <option value="">Select a room to edit</option>
            {rooms.map((room) => (
            <option 
            key={room.id} 
            value={room.name}
            data-room-id={room.id}>
            {room.name}
            </option>
            ))}
        </select>
        <input
            type="text"
            placeholder="Edited room name"
            value={editroom}
            onChange={(e) => setEditroom(e.target.value)}
            //style={{ flex: 2, marginRight: "10px" }}
            style={inputStyle}
        />
        <button onClick={handleEditroom} style={buttonStyle}>
            Edit room
        </button>
        </div>

        </div>       
    </div>
  );
};

export default Maintenancescreen;
