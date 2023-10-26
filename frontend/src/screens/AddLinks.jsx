import { Modal, Input, Button, Upload, message } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import Addfiles from "./AddFiles";

const buttonStyle = {
  width: "100px",
  marginRight: "10px",
};

const suggestionStyle = {
  cursor: "pointer",
};

const suggestionHoverStyle = {
  backgroundColor: "grey",
  color: "white",
};

let exhibitId = null;

const AddLinks = ({ links, setLinks, visible, onSubmit, onCancel }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedExhibitName, setSelectedExhibitName] = useState("");
  const [exhibitPhotoURL, setExhibitPhotoURL] = useState("");
  const [linkList, setLinkList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get("/api/admin/exhibits");

        if (response.data && response.data.exhibits) {
          const data = response.data.exhibits;
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const onSuggestionHandler = async (query) => {
    setSearchQuery(query);
    setSuggestions([]);

    try {
      const selectedSuggestion = suggestions.find(
        (suggestion) => suggestion.title === query
      );

      if (selectedSuggestion) {
        exhibitId = selectedSuggestion.exhibit_id;
        console.log("Exhibit_id:", exhibitId);

        try {
          const response = await axios.get(
            `/api/admin/exhibits/preview-image/${exhibitId}`
          );

          console.log(response.data);
          if (response.data && response.data.url) {
            setSelectedExhibitName(query);
            setExhibitPhotoURL(response.data.url);
          }
        } catch (error) {
          // Handle the error when the image is not found (status code 404)
          console.error("Error fetching exhibit photo:", error);
          setSelectedExhibitName(query);
          setExhibitPhotoURL("https://picsum.photos/200");
          // Set a default dummy image in case of error
        }
      }
    } catch (error) {
      console.error("Error fetching exhibit:", error);
    }
  };

  const handlePlusIconClick = (link) => {
    if (selectedExhibitName === searchQuery.trim() && exhibitId !== null) {
      console.log(link);
      console.log("+is clicked");

      // Define a placeholder URL for the dummy image
      //const dummyImageUrl = 'https://picsum.photos/200';

      // Check if exhibitPhotoURL is empty; if so, use the dummy image URL
      //const imageUrl = exhibitPhotoURL ;

      // Add the selected link to the linkList
      const newLink = {
        uid: `${exhibitId}`,
        name: selectedExhibitName,
        status: "done",
        url: exhibitPhotoURL,
      };

      console.log(newLink);
      setLinkList([...linkList, newLink]);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    let matches = [];
    if (query.length > 0) {
      matches = searchResults.filter((item) => {
        const regex = new RegExp(`${query}`, "gi");
        return item.title.match(regex);
      });
    }
    //console.log(matches)
    setSuggestions(matches);
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
    setSuggestions([]);
    setLinkList([]); // Clear the linkList
  };

  const handleCancel = () => setPreviewOpen(false);

  const handleSubmission = (link) => {
    // Collect the selected link data from the linkList

    // const selectedLinkData = linkList.map((link) => ({
    //   id: link.uid,
    //   name: link.name,
    // }));

    if (linkList.length > 0) {
      message.success("Links are uploaded successfully");
    } else {
      message.info("Please select Links to upload");
    }
    // Call the onSubmit function from props to pass the selected link data to the parent component
    // onSubmit(selectedLinkData);

    setLinkList([]);
    console.log(linkList);
    setSelectedExhibitName("");
    setExhibitPhotoURL("");
    clearSearchQuery();
    onSubmit(linkList);
  };

  const handlePreview = (link) => {
    setPreviewImage(link.url);
    setPreviewTitle(link.name);
    setPreviewOpen(true);
  };

  const handleRemove = (link) => {
    const updatedLinkList = linkList.filter((item) => item.uid !== link.uid);
    setLinkList(updatedLinkList);
  };

  return (
    <div
      title="Add Links"
      visible={visible}
      onCancel={() => {
        clearSearchQuery();
        onCancel();
      }}
      style={{ height: "500px", width: "800px" }}
      centered
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            clearSearchQuery();
            onCancel();
          }}
          style={{ ...buttonStyle, marginRight: 0 }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmission}
          style={buttonStyle}
        >
          Submit
        </Button>,
      ]}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          type="text"
          placeholder="Search..."
          className="col-md-12 input"
          style={{ flex: 1, height: "40px", marginRight: "5px" }}
          value={searchQuery}
          onChange={handleSearch}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ width: "40px", height: "40px", marginTop: "0px" }}
          onClick={handlePlusIconClick}
        />
      </div>

      {suggestions &&
        suggestions.map((suggestion, i) => (
          <div
            key={i}
            className="suggestion col-md-12 justify-content-md-center"
            style={
              hoveredSuggestion === suggestion
                ? { ...suggestionStyle, ...suggestionHoverStyle }
                : suggestionStyle
            }
            onMouseEnter={() => setHoveredSuggestion(suggestion)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            onClick={() => onSuggestionHandler(suggestion.title)}
          >
            {suggestion.title}
          </div>
        ))}

      {linkList.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Upload
            listType="picture-card"
            fileList={linkList}
            onPreview={handlePreview}
            onRemove={handleRemove}
          />
        </div>
      )}
      {previewOpen && (
        <div
          visible={previewOpen}
          title={previewTitle}
          onCancel={handleCancel}
          footer={null}
        >
          <img
            alt="Exhibit Photo"
            style={{
              width: "100%",
            }}
            src={previewImage}
          />
        </div>
      )}
    </div>
  );
};

export default AddLinks;
