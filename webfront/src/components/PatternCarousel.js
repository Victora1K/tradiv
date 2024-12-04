// File: PatternCarousel.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hammer from '../image-patterns/hammer.png';
import hangingman from '../image-patterns/hanging-man.png';
import threeblackcrows from '../image-patterns/three-black-crows.png';


const patternData = [
  { name: 'Hammer', imgSrc: hammer, link: '/patterns#hammer' },
  { name: 'Three Black Crows', imgSrc: threeblackcrows, link: '/patterns#threeblackcrows' },
  { name: 'Hanging Man', imgSrc: hangingman, link: '/patterns#hanging-man' },
  // Add more patterns here
];

const PatternCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Move to the next slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % patternData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? patternData.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % patternData.length);
  };

  return (
    <div style={carouselContainerStyle}>
      <a href={patternData[currentIndex].link} style={patternItemStyle}>
        <img src={patternData[currentIndex].imgSrc} alt={patternData[currentIndex].name} style={imageStyle} />
        <p>{patternData[currentIndex].name}</p>
      </a>
    </div>
  );
};

const carouselContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  maxWidth: '70%',
  height: '400px', // Set the height you want for the carousel
  margin: '20px auto',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
};

const patternItemStyle = {
  textAlign: 'center',
  width: '100%',
  textDecoration: 'none',
  color: 'black',
};

const imageStyle = {
  width: '90%', // Adjust width to take up most of the screen
  maxHeight: '250px',
  objectFit: 'contain',
  borderRadius: '8px',
};

const navButtonStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: '#333',
  color: 'white',
  border: 'none',
  padding: '10px',
  fontSize: '18px',
  cursor: 'pointer',
  zIndex: 1,
};

export default PatternCarousel;
