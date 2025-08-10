// src/components/PropertyInfo.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import usePropertyInfo from "../hooks/usePropertyInfo";
import Button from "./Button";
import Panorama360 from "./Panorama360";
import BookingModal from "./BookingModal";

// helper: turn absolute http://127.0.0.1:8000/images/xyz.jpg into "/images/xyz.jpg"
const toSameOrigin = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    return u.pathname + u.search; // keep it relative => proxied => same-origin
  } catch {
    return url; // already relative
  }
};

const PropertyInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyInfo(id);
  const [openBooking, setOpenBooking] = useState(false);

  if (loading) return <p className="loading-text">Loading property info...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;
  if (!property) return <p className="error-text">No property found.</p>;

  const coverSrc = property.property_image;
  const panoSrc = toSameOrigin(property.property_360_image);

  return (
    <div className="property-info-container">
      <div style={{ fontSize: "20px", marginBottom: "30px", marginTop: "15px" }}>
        <Link style={{ color: "#ff8c00", fontWeight: "bold" }} to="/home">Main</Link> /{" "}
        <Link style={{ color: "#ff8c00", fontWeight: "bold" }} to="/properties">Properties</Link> /{" "}
        <span style={{ fontWeight: "bold" }}>Property Information</span>
      </div>
      <h1>Property Information</h1>

      <div className="top-section">
        <div className="property-image">
          <img src={coverSrc} alt={property.name || "Property"} />
          <div className="status-box">{property.status}</div>
        </div>
      </div>

      <div className="details-section">
        <div className="basic-info">
          <h2>{property.name}</h2>
          <p>{property.description}</p>
        </div>

        <div className="row">
          <div className="col"><strong>Property Type:</strong> {property.property_type}</div>
          <div className="col"><strong>Price:</strong> ${property.price}</div>
        </div>

        <div className="row">
          <div className="col"><strong>Year Built:</strong> {property.year_built}</div>
          <div className="col"><strong>Bedrooms:</strong> {property.bedrooms}</div>
          <div className="col"><strong>Bathrooms:</strong> {property.bathrooms}</div>
          <div className="col"><strong>Size:</strong> {property.size} sq ft</div>
          <div className="col"><strong>Available From:</strong> {property.available_from}</div>
        </div>
      </div>

      <div className="image-360-section" style={{ marginTop: 28 }}>
        <h2>360 image</h2>
        {panoSrc ? (
          <Panorama360 src={panoSrc} height={480} caption={property.name || "360 tour"} />
        ) : (
          <p style={{ opacity: 0.7 }}>No 360 image provided for this property.</p>
        )}
      </div>

      <div className="buttons-container">
        <Button text="Book Now" onClick={() => setOpenBooking(true)} />
        <Button text="Go Back" onClick={() => navigate(-1)} />
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        property={property}
      />
    </div>
  );
};

export default PropertyInfo;
