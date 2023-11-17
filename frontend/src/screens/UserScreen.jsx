
import styled from "styled-components";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import axios from 'axios';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dummyImageUrl from '../assets/dummy-image-square.jpg';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import logo from '../assets/logo.png';
import { LinkContainer } from 'react-router-bootstrap';

const CarouselContainerRow = styled.div`
width: 30%;
height: 18vw;
margin-right: 20px;
overflow: hidden; // Hide the overflow
position: relative;
display: flex; // Added for vertical centering
justify-content: center; // Center horizontally
align-items: center;
`;

// Define a styled component for the column layout
const CarouselContainerColumn = styled.div`
width: 100%; 
height: 60vw;
margin-bottom: 20px;
overflow: hidden;
display: flex; /* Use flexbox for centering vertically */
justify-content: center; /* Center vertically */
align-items: center; /* Center vertically */
`;

const ProductCarouselRow = styled.div`
display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: flex-start;
margin: 20px;
`;

const ProductCarouselColumn = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
justify-content: flex-start;
margin: 20px;
`;

const DescriptionContainer = styled.div`
flex: 1;
`;

const UserScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [mediaUrls, setMediaUrls] = useState([]);
    const [relatedExhibits, setRelatedExhibits] = useState([]);

    const [exhibitData, setExhibitData] = useState({
        title: '',
        category: '',
        subcategory: '',
        room: '',
        location_type: '',
        location: '',
        asset_number: '',
        manufacturer: '',
        era: '',
        exhibit_desc: ''
    });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showArrows, setShowArrows] = useState(window.innerWidth); // Initially set to true for larger screens


    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    const titleStyle = {
        textAlign: 'center',
        margin: '20px 0',
        fontWeight: 'bold',
    };


    const descriptionStyle = {
        whiteSpace: 'pre-line', // Preserve line breaks as paragraphs
        //flex: '1',
    };

    const mediaStyleRow = {
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        margin: 'auto',
        display: 'block',
    };

    const mediaStyleColumn = {
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        margin: 'auto',
        display: 'block',
    };

    const ImageStyleRow = {
        width: 'auto', // Width will be auto to maintain aspect ratio
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '18vw', // Ensure the image's height does not exceed the container's height
        objectFit: 'contain', // Ensures the entire image is visible without stretching or cropping
        margin: 'auto', // Center the image within the container horizontally and vertically
        display: 'block', // Display block for images
    };

    const ImageStyleColumn = {
        width: 'auto', // Width will be auto to maintain aspect ratio
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '60vw', // Ensure the image's height does not exceed the container's height
        objectFit: 'contain', // Ensures the entire image is visible without stretching or cropping
        margin: 'auto', // Center the image within the container horizontally and vertically
        display: 'block', // Display block for images
    };



    const customButtonStyle = {
        position: 'absolute',
        top: '50%',
        background: 'rgba(0, 0, 0, 0.3)',
        border: 'none',
        color: 'white',
        fontSize: '16px', // fixed font size
        width: '30px', // fixed width
        height: '30px',
        cursor: 'pointer',
        transform: 'translateY(-50%)',
    };

    const leftButtonStyle = {
        ...customButtonStyle,
        left: '1vw',
        zIndex: 1,
    };

    const rightButtonStyle = {
        ...customButtonStyle,
        right: '1vw',
        zIndex: 1,
    };

    const arrowButtonStyles = {
        position: 'absolute',
        zIndex: 1000, // High z-index to ensure visibility
        top: '50%', // Centered vertically
        transform: 'translateY(-50%)', // This centers the arrow vertically
        background: '#808080', // Grey background
        color: '#FFFFFF', // White color for the arrows
        border: 'none',
        borderRadius: '50%', // Circular shape
        width: '32px', // Width of the arrow
        height: '32px', // Height of the arrow
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0, // Reset any default padding
    };


    const leftArrowButtonStyle = {
        ...arrowButtonStyles,
        left: '10px', // Adjust the position as necessary
    };

    const rightArrowButtonStyle = {
        ...arrowButtonStyles,
        right: '10px', // Adjust the position as necessary
    };

    const fetchExhibitData = async (Id) => {
        await axios.get(`/api/user/exhibit/${Id}`)
            .then(response => {

                setExhibitData(response.data);
                const exhibitMediaUrls = response.data.attachmentURLS.map((item) => item.url).filter(Boolean);
                console.log("MediaUrls", exhibitMediaUrls)

                if (exhibitMediaUrls.length === 0) {
                    throw new Error('No image URLs found.'); // Throw an error
                }
                setMediaUrls(exhibitMediaUrls);
                console.log('Hi', response.data);
                // Store data in state for prepopulation
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                const defaultImages = [dummyImageUrl];
                setMediaUrls(defaultImages);
            });
    };

    const fetchRelatedExhibits = async (Id) => {
        try {
            const getRelatedExhibitResponse = await axios.get(`/api/user/related-exhibits/${Id}`);

            const relatedExhibitsData = getRelatedExhibitResponse.data.data;

            console.log("relatedExhibitsData", relatedExhibitsData)

            const relatedExhibitsPathsArray = relatedExhibitsData.map((item) => ({
                exhibit_id: item.related_exhibit_id,
                folderName: item.file_location,
                fileName: item.file_name,
                title: item.related_exhibit_title,
            }));

            console.log("relatedExhibitsPathsArray", relatedExhibitsPathsArray)

            const generateRelatedExhibitsPresignedUrlResponse = await fetch(
                "/api/user/generate-presigned-url",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(relatedExhibitsPathsArray),
                }
            );
            // console.log("relatedExhibitPresignedUrls", generateRelatedExhibitsPresignedUrlResponse)
            const relatedExhibitPresignedUrls = await generateRelatedExhibitsPresignedUrlResponse.json();
            console.log("relatedExhibitPresignedUrls", relatedExhibitPresignedUrls)

            const relatedExhibits = relatedExhibitsPathsArray.map((item, index) => ({
                relatedExhibit_id: item.exhibit_id,
                imageUrl: relatedExhibitPresignedUrls.data[index].url || dummyImageUrl, // Use the URL from the response
                title: item.title, // Use the title from the data
            }));
            console.log("relatedExhibits", relatedExhibits)
            setRelatedExhibits(relatedExhibits);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Handle the 404 error here, e.g., set relatedExhibits to an empty array
                setRelatedExhibits([]);
            } else {
                console.error('Error fetching related exhibits:', error);
            }
        }
    };

    useEffect(() => {
        fetchExhibitData(id);
        // console.log('I am here:', exhibitData)
        fetchRelatedExhibits(id);
        // Fetch image data for the exhibit using axios
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setShowArrows(window.innerWidth > 700);
        };


        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [id]);



    const handleRelatedExhibitClick = async (exhibitId) => {
        console.log("you have reached here.....")
        console.log("exhibitId", exhibitId)
        window.scrollTo(0, 0);
        navigate(`/UserScreen/${exhibitId}`);
    };

    const videoRef = useRef(null);

    const handleFullScreen = (event) => {
        event.preventDefault();
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.webkitRequestFullscreen) { // For Safari
                videoRef.current.webkitRequestFullscreen();
            } // Add other vendor prefixes if needed
        }
    };

    const renderMedia = (media, index) => {
        const isVideo = /\.(mp4|webm)(\?|$)/i.test(media);
        const style = isVideo ? mediaStyleRow : (windowWidth <= 600 ? ImageStyleColumn : ImageStyleRow);


        return (
            <div key={index}>
                {isVideo ? (
                    <video ref={videoRef} controls style={style}>
                        <source src={media} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <img src={media} alt={`Media ${isVideo ? 'Video' : 'Image'} ${index}`} style={style} />
                )}
            </div>
        );
    };

    return (
        <>

            <header className='__header'>

                <Navbar expand='sm' collapseOnSelect>
                    <Container>
                        <Navbar.Brand>
                            <a href="https://niagaraaerospacemuseum.org" target="_blank" rel="noopener noreferrer">
                                <img src={logo} alt='Museum' />
                            </a>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls='basic-navbar-nav' />
                        <Navbar.Collapse id='basic-navbar-nav'>
                            <Navbar.Brand className="ms-auto">
                                <a href="https://niagaraaerospacemuseum.org" target="_blank" rel="noopener noreferrer">
                                    Home
                                </a>
                            </Navbar.Brand>





                            {/* <Nav className='ms-auto'> */}

                            {/* (
                    <>
                        <LinkContainer to='/' className='home'>
                        <Navbar.Brand>
                            Home
                        </Navbar.Brand>
                        </LinkContainer>
                    </>
                    )
                </Nav> */}
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>

            <div>
                <div>
                    <h1 style={titleStyle}>{exhibitData ? exhibitData.title : 'Loading...'}</h1>

                </div>
                {windowWidth <= 600 ? (
                    <ProductCarouselColumn>
                        <CarouselContainerColumn>
                            <ResponsiveCarousel
                                showArrows={true}
                                dynamicHeight={true}
                                showThumbs={false}
                                renderArrowPrev={(onClickHandler, hasPrev) =>
                                    hasPrev && (
                                        <button onClick={onClickHandler} style={leftButtonStyle} aria-label="Previous">
                                            <LeftOutlined />
                                        </button>
                                    )
                                }
                                renderArrowNext={(onClickHandler, hasNext) =>
                                    hasNext && (
                                        <button onClick={onClickHandler} style={rightButtonStyle} aria-label="Next">
                                            <RightOutlined />
                                        </button>
                                    )
                                }
                            >
                                {mediaUrls.map((media, index) => renderMedia(media, index))}
                            </ResponsiveCarousel>
                        </CarouselContainerColumn>
                        <DescriptionContainer>
                            <p style={descriptionStyle}>
                                {exhibitData ? exhibitData.exhibit_desc : 'Loading...'}
                            </p>
                        </DescriptionContainer>
                    </ProductCarouselColumn>
                ) : (
                    <ProductCarouselRow>
                        <CarouselContainerRow>
                            <ResponsiveCarousel
                                showArrows={true}
                                dynamicHeight={true}
                                showThumbs={false}
                                renderArrowPrev={(onClickHandler, hasPrev) =>
                                    hasPrev && (
                                        <button onClick={onClickHandler} style={leftButtonStyle} aria-label="Previous">
                                            <LeftOutlined />
                                        </button>
                                    )
                                }
                                renderArrowNext={(onClickHandler, hasNext) =>
                                    hasNext && (
                                        <button onClick={onClickHandler} style={rightButtonStyle} aria-label="Next">
                                            <RightOutlined />
                                        </button>
                                    )
                                }
                            >
                                {mediaUrls.map((media, index) => renderMedia(media, index))}
                            </ResponsiveCarousel>
                        </CarouselContainerRow>
                        <DescriptionContainer>
                            <p style={descriptionStyle}>
                                {exhibitData ? exhibitData.exhibit_desc : 'Loading...'}
                            </p>
                        </DescriptionContainer>
                    </ProductCarouselRow>
                )}



                {relatedExhibits.length > 0 && (
                    <div>
                        <h2 style={{ paddingLeft: '20px' }}>Related Exhibits</h2>
                        <Carousel
                            responsive={responsive}
                            arrows={true}
                            showDots={true}
                            focusOnSelect={true}
                            infinite={true}
                            customLeftArrow={<button style={leftArrowButtonStyle}><LeftOutlined /></button>} // Use a button for better accessibility
                            customRightArrow={<button style={rightArrowButtonStyle}><RightOutlined /></button>} // Use a button for better accessibility
                        >
                            {
                                relatedExhibits.map((exhibit, index) => (
                                    <div className="container" key={index}>
                                        <Link onClick={() => handleRelatedExhibitClick(exhibit.relatedExhibit_id)}>
                                            <div className="image-container" style={{ position: 'relative', textAlign: 'center' }}>
                                                <img
                                                    src={exhibit.imageUrl}
                                                    alt={exhibit.title}
                                                    style={{
                                                        maxWidth: '80%',
                                                        maxHeight: '200px',
                                                        height: 'auto',
                                                        marginLeft: '10%',
                                                        marginRight: '10%',
                                                    }}
                                                />
                                            </div>
                                            <div className="title-container" style={{ bottom: '10px', padding: '20px', textAlign: 'center', color: 'black' }}>
                                                {exhibit.title}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            }
                        </Carousel>
                    </div>
                )
                }




            </div >

        </>
    );
};
export default UserScreen;