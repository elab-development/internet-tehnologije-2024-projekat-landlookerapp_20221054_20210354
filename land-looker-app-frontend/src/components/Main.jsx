import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button"; // Importujemo Button komponentu

const images = [
  "/assets/slider1.jpg",
  "/assets/slider2.jpg",
  "/assets/slider3.jpg",
];

const Main = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      let loadedImages = 0;
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            setLoaded(true);
          }
        };
      });
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [loaded]);

  return (
    <main className="main-container">
      <section className="hero">
        <div className="slideshow">
          {images.map((src, index) => (
            <div
              key={index}
              className={`slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            ></div>
          ))}
        </div>
        <div className="hero-content">
          <h1>Welcome to LandLooker</h1>
          <p>Find your dream property with ease.</p>
          <div className="buttons-container" style={{justifyContent:"center", justifyItems:"center", alignContent:"center", alignItems:"center"}}>
            <Button text="Our Properties" onClick={() => navigate("/properties")} />
            <Button text="Learn More" onClick={() => navigate("/aboutus")} />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h2>Modern Listings</h2>
          <p>Discover the best properties available in the market.</p>
        </div>
        <div className="feature-card">
          <h2>Mountain Views</h2>
          <p>Explore homes with stunning mountain and sunset views.</p>
        </div>
        <div className="feature-card">
          <h2>Trusted Agents</h2>
          <p>Work with experienced professionals to find your perfect home.</p>
        </div>
      </section>
    </main>
  );
};

export default Main;
