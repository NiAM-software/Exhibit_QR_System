import { Modal, Input, Button, Upload, message } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';
import dummyImageUrl from '../assets/dummy-image-square.jpg';

const buttonStyle = {
    width: '100px',
    marginRight: '10px',
};

const suggestionStyle = {
    cursor: 'pointer',
};

const suggestionHoverStyle = {
    backgroundColor: 'grey',
    color: 'white',
};

let exhibitId = null;

const Modifylinks = ({ links, setLinks, link_id, deletelinks, setdeletelinks, visible, onSubmit, onCancel }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedExhibitName, setSelectedExhibitName] = useState('');
    const [exhibitPhotoURL, setExhibitPhotoURL] = useState('');
    const [linkList, setLinkList] = useState([]);
    const [intiallinklist, setintiallinklist] = useState([]);
    const [deletelinklist, setdeletelinklist] = useState([]);
    const [newlyaddedlinks, setnewlyaddedlinks] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [hoveredSuggestion, setHoveredSuggestion] = useState(null);

    const isVideoLink = (link) => /\.(mp4|webm)(\?|$)/i.test(link);

    const fetchrelatedexhibits = async () => {
        try {
            const getrelatedexhibitResponse = await axios.get(`/api/admin/exhibits/related-exhibits/${link_id}`);
            const responsedata = getrelatedexhibitResponse.data.data;
            console.log('responsedata', responsedata);
            const apicallpromises = responsedata.map(async (item) => {
                try {
                    const linkurlresponse = await axios.get(`/api/admin/exhibits/preview-image/${item.related_exhibit_id}`);
                    console.log('linkurlresponse', linkurlresponse);
                    //console.log('${item.related_exhibit_title}', linkurlresponse.data);
                    if (linkurlresponse.data && linkurlresponse.data.url) {
                        const newData = {
                            uid: `${item.related_exhibit_id}`,
                            name: item.related_exhibit_title,
                            status: 'done',
                            url: linkurlresponse.data.url,
                        };
                        return newData;
                    }
                    else if (linkurlresponse.data) {
                        const newData = {
                            uid: `${item.related_exhibit_id}`,
                            name: item.related_exhibit_title,
                            status: 'done',
                            url: dummyImageUrl,
                        };
                        return newData;
                    }

                }
                catch (error) {
                    console.error("Error fetching url of related exhibit:", error);
                    const newData = {
                        uid: `${item.related_exhibit_id}`,
                        name: item.related_exhibit_title,
                        status: 'done',
                        url: dummyImageUrl,
                    };
                    return newData;
                }
            });
            const linkurldata = (await Promise.all(apicallpromises)).filter(item => item);
            //console.log("newArrayOfData", newArrayOfData);
            setLinkList(linkurldata);
            setintiallinklist(linkurldata);
            setdeletelinks(deletelinklist);
        } catch (error) {
            console.error('Error fetching related exhibits:', error);
        }
    };



    useEffect(() => {
        //console.log("entering.......");
        fetchrelatedexhibits();
    }, [link_id]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get("/api/admin/exhibits");

                if (response.data && response.data.exhibits) {
                    const data = response.data.exhibits;
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    const onSuggestionHandler = async (query) => {
        setSearchQuery(query);
        setSuggestions([]);
        try {
            const selectedSuggestion = suggestions.find((suggestion) => suggestion.title === query);

            if (selectedSuggestion) {
                exhibitId = selectedSuggestion.exhibit_id;
                console.log("Exhibit_id:", exhibitId);

                try {
                    const response = await axios.get(`/api/admin/exhibits/preview-image/${exhibitId}`);

                    console.log(response.data);
                    if (response.data && response.data.url) {
                        setSelectedExhibitName(query);
                        setExhibitPhotoURL(response.data.url);
                    }
                } catch (error) {
                    // Handle the error when the image is not found (status code 404)
                    console.error('Error fetching exhibit photo:', error);
                    setSelectedExhibitName(query);
                    setExhibitPhotoURL('https://picsum.photos/200');
                    // Set a default dummy image in case of error
                }
            }
        } catch (error) {
            console.error('Error fetching exhibit:', error);
        }
    };

    const handlePlusIconClick = (link) => {
        if (selectedExhibitName === searchQuery.trim() && exhibitId !== null) {
            console.log(link);
            console.log("+is clicked");

            // Add the selected link to the linkList
            const newLink = {
                uid: `${exhibitId}`,
                name: selectedExhibitName,
                status: 'done',
                url: exhibitPhotoURL,
            };

            console.log(newLink);
            setLinkList([...linkList, newLink]);
            setnewlyaddedlinks([...newlyaddedlinks, newLink]);
            setLinks([...newlyaddedlinks, newLink]);
            setSearchQuery("");
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
        setSearchQuery('');
        setSuggestions([]);
        setLinkList(intiallinklist); // Clear the linkList
        setnewlyaddedlinks([]);
        setdeletelinklist([]);
        setdeletelinks([]);
    };

    const handleCancel = () => setPreviewOpen(false);

    const handleSubmission = (link) => {
        // Collect the selected link data from the linkList

        // const selectedLinkData = linkList.map((link) => ({
        //   id: link.uid,
        //   name: link.name,
        // }));

        if (linkList.length > 0) {
            message.success('Links are uploaded successfully');
        } else {
            message.info('Please select Links to upload');
        }
        // Call the onSubmit function from props to pass the selected link data to the parent component
        // onSubmit(selectedLinkData);

        //setLinkList([]);
        setSelectedExhibitName('');
        setExhibitPhotoURL('');
        clearSearchQuery();
        onSubmit(newlyaddedlinks);
    };

    const handlePreview = (link) => {
        setPreviewImage(link.url);
        setPreviewTitle(link.name);
        setPreviewOpen(true);
    };

    console.log("linklist", linkList);
    console.log("newlyaddedlinklist", newlyaddedlinks);
    console.log("deletedfiles", deletelinklist);

    const handleRemove = (link) => {
        const updatedLinkList = linkList.filter((item) => item.uid !== link.uid);
        setLinkList(updatedLinkList);

        const removedFile_initial = intiallinklist.find(initialFile => initialFile.uid === link.uid);
        if (removedFile_initial) {
            // The file has been removed, you can take further action if needed
            console.log(`File removed: ${link.name}`);
            // You can also store information about the removed file
            const deletedFile = {
                related_exhibit_id: removedFile_initial.uid,
                related_exhibit_title: removedFile_initial.name,
            };

            // Add the deleted file to the array
            setdeletelinklist([...deletelinklist, deletedFile]);
            setdeletelinks([...deletelinklist, deletedFile]);
            //setdeletefiles([...deletedFiles, deletedFile]);
        }
        else {
            const removednewfilename = newlyaddedlinks.find(item => item.uid == link.uid);
            if (removednewfilename) {
                const newaddedfiles = newlyaddedlinks.filter(item => item.uid !== removednewfilename.uid);
                setnewlyaddedlinks(newaddedfiles);
                //setFiles(newaddedfiles);
            }
        }
    };

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

        console.log('link', link);
        const isVideo = /\.(mp4|webm)(\?|$)/i.test(link.url);
        return (
            <div className="ant-upload-list-item">
                <div style={thumbnailStyle}>
                    {isVideo ? (
                        <video
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            controls
                            src={link.url}
                        />
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
                        href={link.url}
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
            style={{ height: "100%", width: "100%", paddingTop: '8px' }}
            centered
        // footer={[
        //     <Button
        //         key="cancel"
        //         onClick={() => {
        //             clearSearchQuery();
        //             onCancel();
        //         }}
        //         style={{ ...buttonStyle, marginRight: 0 }}
        //     >
        //         Cancel
        //     </Button>,
        //     <Button
        //         key="submit"
        //         type="primary"
        //         onClick={handleSubmission}
        //         style={buttonStyle}
        //     >
        //         Submit
        //     </Button>,
        // ]}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                    type="text"
                    placeholder="Search..."
                    className="col-md-12 input"
                    style={{ flex: 0.3, height: '40px', marginRight: '5px' }}
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: '40px', height: '40px', marginTop: '0px' }}
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
                console.log('linkList', linkList),

                < div style={{ marginTop: '16px' }}>
                    <Upload
                        listType="picture-card"
                        fileList={linkList}
                        onPreview={handlePreview}
                        onRemove={handleRemove}
                        itemRender={(originNode, link, linkList, actions) => renderItem(originNode, link, linkList, actions)}
                    />
                </div>
            )
            }
            {
                previewOpen && (
                    <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                        {isVideoLink(previewImage) ? (
                            <video style={{ width: '100%' }} controls>
                                <source src={previewImage} type="video/mp4" />
                                Your browser does not support HTML video.
                            </video>
                        ) : (
                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                        )}
                    </Modal>
                )
            }
        </div >
    );
};

export default Modifylinks;