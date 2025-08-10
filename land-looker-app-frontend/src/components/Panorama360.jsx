// src/components/Panorama360.jsx
import React, { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

const Panorama360 = ({ src, height = 480, caption = "" }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // 1) Init once
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: src,          // initial image (can be null/undefined)
      caption,
      mousewheel: true,
      touchmoveTwoFingers: false,
      navbar: ["zoom", "move", "fullscreen"],
    });

    viewerRef.current = viewer;

    // 3) Destroy safely on unmount
    return () => {
      try {
        viewer.destroy();
      } catch (_) {
        // ignore double-destroy in dev strict mode
      } finally {
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- init once only

  // 2) Update panorama when `src` or `caption` changes
  useEffect(() => {
    if (!viewerRef.current || !src) return;
    viewerRef.current.setPanorama(src, { caption }).catch(() => {
      // ignore if component unmounted mid-update
    });
  }, [src, caption]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        background: "#f6f6f6",
      }}
      aria-label="360 degree panorama viewer"
    />
  );
};

export default Panorama360;
