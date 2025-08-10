// src/components/AuthBgSlider.jsx
import React, { useEffect, useMemo, useState } from "react";

const AuthBgSlider = ({
  images = [],
  interval = 5000, // ms between slides
  overlay = "rgba(255,255,255,0.45)",
}) => {
  const [idx, setIdx] = useState(0);
  const slides = useMemo(() => images.filter(Boolean), [images]);

  // Preload images
  useEffect(() => {
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [slides]);

  // Cycle through slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {slides.map((src, i) => (
        <div
          key={src + i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "opacity 800ms ease",
            opacity: i === idx ? 1 : 0,
          }}
        />
      ))}
      {/* Readability overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlay,
        }}
      />
    </div>
  );
};

export default AuthBgSlider;
