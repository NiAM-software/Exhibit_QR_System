import { Modal, Input, Button, Upload, message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import Addfiles from "./AddFiles";
import dummyImageUrl from '../assets/dummy-image-square.jpg';
import { DeleteOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';

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
  const [previewLinkType, setPreviewLinkType] = useState('');
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const mediaRef = useRef(null);


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
          setExhibitPhotoURL(dummyImageUrl);
          // Set a default dummy image in case of error
        }
      }
    } catch (error) {
      console.error("Error fetching exhibit:", error);
    }
  };

  const isDuplicateExhibit = () => {
    // Check if the selected exhibit is already in the linkList
    return linkList.some((link) => link.name === selectedExhibitName);
  };

  const handlePlusIconClick = (link) => {
    if (selectedExhibitName === searchQuery.trim() && exhibitId !== null) {
      console.log(link);
      console.log("+is clicked");

      if (!isDuplicateExhibit()) {
        const newLink = {
          uid: `${exhibitId}`,
          name: selectedExhibitName,
          status: "done",
          url: exhibitPhotoURL,
        };

        console.log(newLink);
        setLinkList([...linkList, newLink]);
        setLinks([...linkList, newLink]);
        setSearchQuery("");
      } else {
        message.error("Exhibit is already in the list.");
        setSearchQuery("");
      }
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

  const handleCancel = () => {
    // Stop the media playback if it's a video or audio
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
    }
  
    setPreviewOpen(false);
    setPreviewImage('');
    setPreviewLinkType('');
    setPreviewTitle('');
  };

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

  const PreviewModalContent = ({ fileType, source }) => {
    useEffect(() => {
      // Ensure the media stops playing when the source changes
      if (mediaRef.current) {
        mediaRef.current.pause();
      }
    }, [source]);
    
    switch (fileType) {
      case 'video':
        return (
          <video ref={mediaRef} style={{ width: '100%' }} controls>
            <source src={source} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        );
      case 'audio':
        return (
          <audio ref={mediaRef} style={{ width: '100%' }} controls>
            <source src={source} type="audio/mpeg" />
            Your browser does not support HTML audio.
          </audio>
        );
      case 'image':
        return <img alt="example" style={{ width: '100%' }} src={source} />;
      default:
        return null;
    }
  };

  const handlePreview = (link) => {
    const isVideoLink = /\.(mp4|webm)(\?|$)/i.test(link.url);
    const isAudioLink = /\.(mp3|mpeg|wav)(\?|$)/i.test(link.url);
    setPreviewImage(link.url);
    setPreviewTitle(link.name);
    setPreviewLinkType(isVideoLink ? 'video' : isAudioLink ? 'audio' : 'image');
    setPreviewOpen(true);
  };

  const handleRemove = (link) => {
    const updatedLinkList = linkList.filter((item) => item.uid !== link.uid);
    setLinkList(updatedLinkList);
  };

  useEffect(() => {
    // Clean up function to revoke object URLs
    return () => {
      if (previewLinkType === 'video') {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, previewLinkType]);

  const renderItem = (originNode, link, linkList, actions) => {
    const thumbnailStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      overflow: 'hidden', // To handle videos that might exceed the container size
    };
    const actionButtonStyle = {
      background: 'transparent',
      border: 'none', // Remove button border
      boxShadow: 'none', // Remove button shadow if any
    };

    const isVideo = /\.(mp4|webm)(\?|$)/i.test(link.url);
    const isAudio = /\.(mp3|mpeg|wav)(\?|$)/i.test(link.url);

    return (
      <div className="ant-upload-list-item">
        <div style={thumbnailStyle}>
          {isVideo ? (
            <video
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              controls
              src={link.url}
            />
          ) : isAudio ? (
            <audio 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            controls 
            src={link.url}/>
          ) : (
            <img
              src={link.url}
              alt={link.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <div className="ant-upload-list-item-actions">
          <a
            href={link.url || link.preview}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => {
              e.preventDefault();
              handlePreview(link);
            }}
          >
            <Button icon={<EyeOutlined />} size="small" style={actionButtonStyle} />
          </a>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            style={actionButtonStyle}
            onClick={() => actions.remove(link)}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      title="Add Links"
      visible={visible}
      onCancel={() => {
        clearSearchQuery();
        onCancel();
      }}
      style={{ height: "100%", width: "100%", marginTop: "10px", paddingTop: '8px' }}
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
          style={{ flex: 0.3, height: "40px", marginRight: "5px" }}
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
            itemRender={(originNode, link, linkList, actions) => renderItem(originNode, link, linkList, actions)}
          />
        </div>
      )}

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <PreviewModalContent fileType={previewLinkType} source={previewImage} />
      </Modal>
    </div>
  );
};

export default AddLinks;
