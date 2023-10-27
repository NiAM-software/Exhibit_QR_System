// import React from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import { Carousel } from 'react-responsive-carousel';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';

// const titleStyle = {
//   textAlign: 'center',
//   margin: '20px 0',
//   fontWeight: 'bold',
// };

// const productCarouselStyle = {
//   display: 'flex',
//   alignItems: 'flex-start',
//   justifyContent: 'flex-start',
//   margin: '20px',
// };

// const carouselContainerStyle = {
//   width: '30%',
//   marginRight: '20px',
//   maxHeight: '70vh',
//   overflowY: 'auto',
// };

// const descriptionContainerStyle = {
//   flex: 1,
// };

// const leftPanelImgStyle = {
//   width: '100%',
// };

// const customButtonStyle = {
//   position: 'absolute',
//   top: '50%',
//   background: 'rgba(0, 0, 0, 0.3)',
//   border: 'none',
//   color: 'white',
//   fontSize: '1vw',
//   width: '2vw',
//   height: '2vw',
//   cursor: 'pointer',
//   transform: 'translateY(-50%)',
// };

// const leftButtonStyle = {
//   ...customButtonStyle,
//   left: '1vw',
//   zIndex: 1,
// };

// const rightButtonStyle = {
//   ...customButtonStyle,
//   right: '1vw',
//   zIndex: 1,
// };

// const carouselImages = [
//   'https://picsum.photos/600',
//   'https://picsum.photos/601',
//   'https://picsum.photos/602',
// ];

// const ProductScreen = () => {
//   const { exhibitId } = useParams();
//   const location = useLocation();
//   const exhibitData = location.state ? location.state.exhibitData : null;
//   const [imageUrls, setImageUrls] = useState([]);

//   return (
//     <div>
//       <div>
//         <h1 style={titleStyle}>{exhibitData ? exhibitData.title : 'Loading...'}</h1>
//       </div>
//       try {
//           const response = await axios.get(`/api/exhibits/preview-image/${exhibitId}`);

//           console.log(response.data);

//         } catch (error) {
//           // Handle the error when the image is not found (status code 404)
//           console.error('Error fetching exhibit photo:', error);          
//         }
//       <div style={productCarouselStyle}>
//         <div style={carouselContainerStyle}>
//           <Carousel
//             showArrows={true}
//             dynamicHeight={true}
//             showThumbs={false}
//             renderArrowPrev={(onClickHandler, hasPrev) =>
//               hasPrev && (
//                 <button
//                   onClick={onClickHandler}
//                   style={leftButtonStyle}
//                   aria-label="Previous"
//                 >
//                   &lt;
//                 </button>
//               )
//             }
//             renderArrowNext={(onClickHandler, hasNext) =>
//               hasNext && (
//                 <button
//                   onClick={onClickHandler}
//                   style={rightButtonStyle}
//                   aria-label="Next"
//                 >
//                   &gt;
//                 </button>
//               )
//             }
//           >
//             {carouselImages.map((image, index) => (
//               <div key={index}>
//                 <img src={image} alt={`Exhibit Image ${index}`} style={leftPanelImgStyle} />
//               </div>
//             ))}
//           </Carousel>
//         </div>
//         <div style={descriptionContainerStyle}>
//           <p>
//             {exhibitData
//               ? exhibitData.exhibit_desc
//               : 'Loading...'}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductScreen;


import styled from "styled-components";
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import axios from 'axios';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dummy from '../assets/dummy-image-square.jpg';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// const dummyImageUrl = getBase64('../assets/dummy-image-square.jpg');

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageUrls, setImageUrls] = useState([]);
  const [relatedExhibits, setRelatedExhibits] = useState([]);
  const dummyImageUrl = "https://picsum.photos/200";
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
  // console.log(id)
  // console.log('exhibitData:',exhibitData)

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

  const verticalArrowsStyle = {
    transform: 'rotate(90deg)', // Rotate arrows vertically
  };

  const customButtonGroupStyle = {
    display: 'flex',
    flexDirection: 'column', // Rotate buttons vertically
    alignItems: 'center',
  };


  const rlcustomButtonGroupStyle = {
    top: '50%',
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.3)',
    border: 'none',
    color: 'white',
    fontSize: '1vw',
    width: '2.5rem',
    height: '2.5rem',
    cursor: 'pointer',
    borderRadius: '50%', // Make the buttons circular
    transform: 'translateY(-50%)',
    zIndex: 1,
  };

  const rlcustomLeftButtonStyle = {
    ...rlcustomButtonGroupStyle,
    // marginRight: '1rem', // Add margin between the buttons
    left: '20px',
  };

  const rlcustomRightButtonStyle = {
    ...rlcustomButtonGroupStyle,
    right: '20px',
  };

  const sliderStyle = {
    margin: '0 20px',
    overflow: 'hidden', // Removed double quotes around "hidden"
    padding: '2rem 0',
  };

  const sliderImageStyle = {
    width: '100%',
    borderRadius: '10px', // Added border-radius
  };




  const titleStyle = {
    textAlign: 'center',
    margin: '20px 0',
    fontWeight: 'bold',
  };

  const productCarouselStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    margin: '20px',
  };


  const carouselContainerStyle = {
    width: '30%',
    marginRight: '20px',
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  const descriptionContainerStyle = {
    flex: 1,
  };

  const descriptionStyle = {
    whiteSpace: 'pre-line', // Preserve line breaks as paragraphs
  };

  const leftPanelImgStyle = {
    width: '100%',
  };

  const customButtonStyle = {
    position: 'absolute',
    top: '50%',
    background: 'rgba(0, 0, 0, 0.3)',
    border: 'none',
    color: 'white',
    fontSize: '1vw',
    width: '2vw',
    height: '2vw',
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

  const fetchExhibitData = async (Id) => {
    await axios.get(`/api/admin/exhibits/${Id}`)
      .then(response => {
        setExhibitData(response.data); // Store data in state for prepopulation
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });


    console.log('data for exhibitid: ${Id}', exhibitData)

  };

  const fetchExhibitImages = async (Id) => {
    try {
      // Fetch attachments data
      const getExhibitAttachmentsResponse = await axios.get(`/api/admin/exhibits/get-attachments/${Id}`);
      const exhibitAttachmentsData = getExhibitAttachmentsResponse.data.data;
      console.log("exhibitAttachmentsData:", exhibitAttachmentsData)
      const exhibitPathsArray = exhibitAttachmentsData.map((item) => ({
        folderName: item.file_location,
        fileName: item.file_name,
      }));

      // const at_data = {
      //   objectKeys: exhibitPathsArray,
      // }
      // console.log("exhibitPathsArray", JSON.stringify(at_data))
      // Get Presigned urls

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

      const exhibitImageUrls = exhibitPresignedUrls.data.map((item) => item.url).filter(Boolean);
      console.log("exhibitImageUrls", exhibitImageUrls)

      if (exhibitImageUrls.length === 0) {
        throw new Error('No image URLs found.'); // Throw an error
      }
      // Set the imageUrls state
      setImageUrls(exhibitImageUrls);
    } catch (error) {
      console.error('horror fetching exhibit images:', error);

      // If there's an error, you can set some default images or handle the error as needed
      const defaultImages = [dummyImageUrl];
      setImageUrls(defaultImages);
    }
  };

  const fetchRelatedExhibits = async (Id) => {
    try {
      const getRelatedExhibitResponse = await axios.get(`/api/admin/exhibits/related-exhibits/${Id}`);

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
    // Fetch image data for the exhibit using axios

    fetchExhibitData(id);
    fetchExhibitImages(id);
    fetchRelatedExhibits(id);

  }, [id]);



  const handleRelatedExhibitClick = async (exhibitId) => {
    console.log("you have reached here.....")
    console.log("exhibitId", exhibitId)
    navigate(`/ProductScreen/${exhibitId}`);
  };

  return (
    <div>
      <div>
        <h1 style={titleStyle}>{exhibitData ? exhibitData.title : 'Loading...'}</h1>

      </div>

      <div style={productCarouselStyle}>
        <div style={carouselContainerStyle}>
          <ResponsiveCarousel
            showArrows={true}
            dynamicHeight={true}
            showThumbs={false}
            renderArrowPrev={(onClickHandler, hasPrev) =>
              hasPrev && (
                <button onClick={onClickHandler} style={leftButtonStyle} aria-label="Previous">
                  &lt;
                </button>
              )
            }
            renderArrowNext={(onClickHandler, hasNext) =>
              hasNext && (
                <button onClick={onClickHandler} style={rightButtonStyle} aria-label="Next">
                  &gt;
                </button>
              )
            }
          >
            {imageUrls.map((image, index) => (
              <div key={index}>
                <img src={image} alt={`Exhibit Image ${index}`} style={leftPanelImgStyle} />
              </div>
            ))}
          </ResponsiveCarousel>
        </div>
        <div style={descriptionContainerStyle}>
          <p style={descriptionStyle}>{exhibitData ? exhibitData.exhibit_desc : 'Loading...'}</p>
        </div>
      </div>
      {relatedExhibits.length > 0 && (
        <div>
          <h2>Related Exhibits</h2>

          <Carousel
            responsive={responsive}
            arrows={true}
            showDots={true}
            focusOnSelect={true}
            //autoPlay={true}
            // swipeable={true}
            // draggable={true}


            // customButtonGroup={<rlcustomButtonGroupStyle />}
            infinite={true}
          //  partialVisible={true}
          // customDotListClass={customDotListStyle}
          // customDot={dotButtonStyle}
          // customDotActive={activeDotButtonStyle}
          // renderButtonGroupOutside={true}

          >
            {relatedExhibits.map((exhibit, index) => (
              //<Wrapper key={index}>
              <div className="container">
                <Link
                  // to={`/ProductScreen/${exhibit.relatedExhibit_id}`}
                  // style={{ textDecoration: 'none' }}
                  onClick={() => handleRelatedExhibitClick(exhibit.relatedExhibit_id)}
                >
                  <div className="banner-image" style={{ position: 'relative', textAlign: 'center' }}>
                    <figure>
                      <img src={exhibit.imageUrl} alt={exhibit.title} style={{
                        maxWidth: '80%', // Set a maximum width for the image
                        height: 'auto', // Allow the height to adjust proportionally
                        marginLeft: '10%', // Add a left margin to adjust the spacing
                        marginRight: '10%',
                      }} />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          color: 'white',
                          padding: '10px',
                          textShadow: '2px 2px 4px black',
                          textDecoration: 'underline',
                          textDecorationColor: 'white',
                          WebkitTextStroke: '0.1px black',
                        }}

                      >
                        {exhibit.title}
                      </div>
                    </figure>
                  </div>
                </Link>
              </div>

              // </div>
              //</Wrapper>
            ))}

          </Carousel>
        </div>
      )}
    </div>
  );
};

export default ProductScreen;
