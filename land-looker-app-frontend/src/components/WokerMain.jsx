// src/components/WorkerMain.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const images = [
  `/assets/slider1.jpg`,
  `/assets/slider2.jpg`,
  `/assets/slider3.jpg`,
];

const WorkerMain = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let loadedImages = 0;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) setLoaded(true);
      };
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loaded]);

  return (
    <main className="main-container">
      <section className="hero">
        <div className="slideshow1">
          {images.map((src, index) => (
            <div
              key={index}
              className={`slide1 ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="hero-content">
          <h1>Welcome, Seller</h1>
          <p>List faster. Manage smarter. Close with confidence.</p>

          <div
            className="buttons-container"
            style={{
              justifyContent: "center",
              justifyItems: "center",
              alignContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button
              text="Manage Properties"
              onClick={() => navigate("/worker-properties")}
            />
            <Button
              text="Manage Bookings"
              onClick={() => navigate("/worker-bookings")}
            />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h2>Effortless Publishing</h2>
          <p>Create, edit, and organize listings in minutes.</p>
        </div>
        <div className="feature-card">
          <h2>Booking Control</h2>
          <p>Track requests, confirm visits, and keep schedules tidy.</p>
        </div>
        <div className="feature-card">
          <h2>Pro Presentation</h2>
          <p>Stand out with rich media, 360 views, and clean details.</p>
        </div>
      </section>
    </main>
  );
};

export default WorkerMain;
