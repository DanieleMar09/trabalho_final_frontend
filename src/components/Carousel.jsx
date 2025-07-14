import React, { useState, useEffect } from 'react';
import '../styles/Carousel.css';

import carro1 from '../assets/images/banner1.jpeg';
import carro2 from '../assets/images/banner2.png';
import carro3 from '../assets/images/banner3.jpg';


const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    carro1,
    carro2,
    carro3,

  ];

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000); // Troca a cada 3 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, []);

  return (
    <div className="carousel">
      <button onClick={prevImage} className="carousel-button prev">
        &#10094;
      </button>
      <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
      <button onClick={nextImage} className="carousel-button next">
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
