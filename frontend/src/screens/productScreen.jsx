
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
import LazyLoad from 'react-lazyload';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// const dummyImageUrl = getBase64('../assets/dummy-image-square.jpg');

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

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [mediaUrls, setMediaUrls] = useState([]);
  const [relatedExhibits, setRelatedExhibits] = useState([]);
  const videoRef = useRef({});
  // const audioRef = useRef(null);
  const audioRef = useRef({});

  //const dummyImageUrl = "https://picsum.photos/200";
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
  const [isLoading, setIsLoading] = useState(true);

  console.log('ProductScreen is rendering!'); // This will log on every render

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
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
    // fontSize: '1vw',
    // width: '2vw',
    // height: '2vw',
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


useEffect(() => {
 
  const fetchData = async () => {
    try {
      // Fetch exhibit data
      const exhibitResponse = await axios.get(`/api/admin/exhibits/${id}`);
      setExhibitData(exhibitResponse.data);

      // Fetch exhibit media
      const getExhibitAttachmentsResponse = await axios.get(`/api/admin/exhibits/get-attachments/${id}`);
        const exhibitAttachmentsData = getExhibitAttachmentsResponse.data.data;
        console.log("exhibitAttachmentsData:", exhibitAttachmentsData)
        const exhibitPathsArray = exhibitAttachmentsData.map((item) => ({
          folderName: item.file_location,
          fileName: item.file_name,
        }));

        const generateExhibitPresignedUrlResponse = await fetch(
          "/api/admin/exhibits/generate-presigned-url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(exhibitPathsArray),
          }
        );

        const exhibitPresignedUrls = await generateExhibitPresignedUrlResponse.json(); // Convert the response to JSON
        console.log("generateExhibitPresignedUrlResponse", exhibitPresignedUrls); // Now you can access the JSON data

        const exhibitMediaUrls = exhibitPresignedUrls.data.map((item) => item.url).filter(Boolean);
        console.log("exhibitMediaUrls", exhibitMediaUrls)

        if (exhibitMediaUrls.length === 0) {
          throw new Error('No image URLs found.'); // Throw an error
        }
        // Set the imageUrls state
        setMediaUrls(exhibitMediaUrls);

      // Fetch related exhibits
      const getRelatedExhibitResponse = await axios.get(`/api/admin/exhibits/related-exhibits/${id}`);

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
          "/api/admin/exhibits/generate-presigned-url",
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

      // Set loading to false when everything is fetched
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false); // Set loading to false even if there's an error
    }
  };

  fetchData();

  // Add event listener for window resize
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    setShowArrows(window.innerWidth > 700);
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    setMediaUrls([]);
    setRelatedExhibits([]);
  };
}, [id]);

  const handleRelatedExhibitClick = async (exhibitId) => {
    console.log("you have reached here.....")
    console.log("exhibitId", exhibitId)
    setRelatedExhibits([]);
    window.scrollTo(0, 0);
    navigate(`/ProductScreen/${exhibitId}`);
  };
  
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

  const handleSlideChange = () => {
    console.log('Slide changed!');
  
    console.log('Current audio refs:', audioRef.current);
    // Pause and reset the playback position for all audio elements
    Object.values(audioRef.current).forEach(audio => {
    if (audio) {
      console.log('Pausing audio:', audio);
      audio.pause();
      audio.currentTime = 0;
    }
  });

  // Pause and reset the playback position for all video elements
  Object.values(videoRef.current).forEach(video => {
    if (video) {
      console.log('Pausing video:', video);
      video.pause();
      video.currentTime = 0;
    }
  });
};
  
  const renderMedia = (media, index) => {
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(media);
    const isAudio = /\.(mp3|audio|mpeg|wav|ogg)(\?|$)/i.test(media);
    const mediaKey = isVideo || isAudio ? media : `image_${index}`;

    const containerStyle = isVideo || isAudio ? 
      { ...mediaStyleRow, height: 'auto', display: 'flex',overflow: 'visible', justifyContent: 'center', alignItems: 'center' } : 
      (windowWidth <= 600 ? ImageStyleColumn : ImageStyleRow);
  
      if (isVideo) {
        return (
          <LazyLoad height={200} offset={100} key={mediaKey}>
          <div style={{ width: '100%', height: windowWidth <= 600 ? '60vw' : '18vw', overflow: 'hidden' }}>
            <video controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} ref={(element) => videoRef.current[mediaKey] = element}>
              <source src={media} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          </LazyLoad>
        );
  } else if (isAudio) {
    return (
      <LazyLoad height={200} offset={100} key={mediaKey}>
      <div style={{ width: '100%' }}>
        <audio
          controls
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          ref={(element) => {
            audioRef.current[mediaKey] = element; // Store a ref for each audio element
          }}
        >
          <source src={media} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      </LazyLoad>
    );
    
  } else {
    return (
      <LazyLoad height={200} offset={100} key={mediaKey}>
      <img src={media} alt={`Media Image ${index}`} style={containerStyle} />
      </LazyLoad>
    );
  }
};

  

  return (
    <div>
    {isLoading ? (
      <p>Loading...</p>
    ) : (
    <div>
      <div>
        <h1 style={titleStyle}>{exhibitData ? exhibitData.title : 'Loading...'}</h1>
        <div style={{ textAlign: 'right', marginBottom: '10px', paddingRight: '20px' }}>
          {exhibitData.era && (
            <p><strong>Era:</strong> {exhibitData.era}</p>
          )}
          {exhibitData.manufacturer && (
            <p><strong>Manufacturer:</strong> {exhibitData.manufacturer}</p>
          )}
        </div>
      </div>
      {windowWidth <= 600 ? (
        <ProductCarouselColumn>
          {mediaUrls.length > 0 && (
          <CarouselContainerColumn>
            <ResponsiveCarousel
              showArrows={true}
              dynamicHeight={true}
              showThumbs={false}
              onChange={handleSlideChange} // Add this prop
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
          )}
          <DescriptionContainer>
            <p style={descriptionStyle}>
              {exhibitData ? exhibitData.exhibit_desc : 'Loading...'}
            </p>
          </DescriptionContainer>
        </ProductCarouselColumn>
      ) : (
        <ProductCarouselRow>
          {mediaUrls.length > 0 && (
          <CarouselContainerRow>
            <ResponsiveCarousel
              showArrows={true}
              dynamicHeight={true}
              showThumbs={false}
              onChange={handleSlideChange}
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
          )}
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
            infinite={false}
            customLeftArrow={<button style={leftArrowButtonStyle}><LeftOutlined /></button>} // Use a button for better accessibility
            customRightArrow={<button style={rightArrowButtonStyle}><RightOutlined /></button>} // Use a button for better accessibility
          >
            

          {relatedExhibits.map((exhibit, index) => (
            <div className="container" key={index}>
              <Link onClick={() => handleRelatedExhibitClick(exhibit.relatedExhibit_id)}>
                {exhibit.imageUrl ? (
                  // Use a conditional check to show dummy image for audio or video
                  /\.(mp3|audio|mpeg|wav|ogg|mp4|webm)(\?|$)/i.test(exhibit.imageUrl) ? (
                    <div className="image-container" style={{ position: 'relative', textAlign: 'center' }}>
                      <img
                        src={dummyImageUrl}
                        alt="Dummy Image"
                        style={{
                          maxWidth: '80%',
                          maxHeight: '200px',
                          height: 'auto',
                          marginLeft: '10%',
                          marginRight: '10%',
                        }}
                      />
                    </div>
                  ) : (
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
                  )
                ) : (
                  <div className="image-container" style={{ position: 'relative', textAlign: 'center' }}>
                    <img
                      src={dummyImageUrl}
                      alt="Dummy Image"
                      style={{
                        maxWidth: '80%',
                        maxHeight: '200px',
                        height: 'auto',
                        marginLeft: '10%',
                        marginRight: '10%',
                      }}
                    />
                  </div>
                )}
                <div className="title-container" style={{ bottom: '10px', padding: '20px', textAlign: 'center', color: 'black' }}>
                  {exhibit.title}
                </div>
              </Link>
            </div>
          ))}

          </Carousel>
        </div>
      )
      }




    </div >
    )}
    </div>
  );
};

export default ProductScreen;