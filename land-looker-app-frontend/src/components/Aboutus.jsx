import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaGlobe,
  FaRocket,
  FaLightbulb,
  FaRegHandshake,
  FaLeaf,
  FaRobot
} from "react-icons/fa";

const images = [
  "/assets/slider4.jpg",
  "/assets/slider5.jpg",
  "/assets/slider6.jpg",
  "/assets/slider7.jpg",
  "/assets/slider8.jpg",
  "/assets/slider9.jpg",
  "/assets/slider10.jpg",
];

const AboutUs = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Preload slider images
  useEffect(() => {
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
  }, []);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded]);

  // Timeline data
  const timelineData = [
    {
      year: "2010",
      title: "The Beginning",
      desc: "LandLooker was founded to revolutionize real estate.",
      icon: <FaBuilding />,
    },
    {
      year: "2015",
      title: "Expansion",
      desc: "We expanded across cities with AI-powered property matching.",
      icon: <FaGlobe />,
    },
    {
      year: "2020",
      title: "Global Reach",
      desc: "LandLooker became an international real estate leader.",
      icon: <FaRocket />,
    },
    {
      year: "Today",
      title: "The Future",
      desc: "We are shaping the future with smart property solutions.",
      icon: <FaLightbulb />,
    },
  ];

  return (
    <div className="about-container">
      {/* Background Slider */}
      <div className="slideshow">
        {images.map((src, i) => (
          <div
            key={i}
            className={`slide ${i === currentImageIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="about-content">
        <h1>About LandLooker</h1>
        <p>Connecting people with their dream properties since 2010.</p>

        {/* Horizontal Timeline */}
        <div className="timeline">
          {timelineData.map((item, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-icon">{item.icon}</div>
              <div className="timeline-info">
                <h2>{item.year} - {item.title}</h2>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Company Values */}
        <div className="company-values">
          <h2>Our Values</h2>
          <ul>
            <li>
              <FaRegHandshake className="icon" /> 
              Customer-Centric - We prioritize finding the perfect home.
            </li>
            <li>
              <FaLightbulb className="icon" /> 
              Transparency - Clear and honest property listings.
            </li>
            <li>
              <FaRobot className="icon" /> 
              Innovation - AI-driven solutions for real estate.
            </li>
            <li>
              <FaLeaf className="icon" /> 
              Sustainability - Supporting eco-friendly housing.
            </li>
          </ul>
        </div>

        {/* Company Goals */}
        <div className="company-goals">
          <h2>Our Goals</h2>
          <p>By 2030, LandLooker aims to:</p>
          <ul>
            <li>
              <FaGlobe className="icon" /> 
              Become the #1 global real estate platform.
            </li>
            <li>
              <FaLightbulb className="icon" /> 
              Provide AI-powered property insights.
            </li>
            <li>
              <FaRocket className="icon" /> 
              Expand into smart home technology.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
