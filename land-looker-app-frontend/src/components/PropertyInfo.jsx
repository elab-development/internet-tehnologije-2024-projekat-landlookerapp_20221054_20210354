import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import usePropertyInfo from "../hooks/usePropertyInfo";
import Button from "./Button";

const PropertyInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyInfo(id);

  if (loading) return <p className="loading-text">Loading property info...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;
  if (!property) return <p className="error-text">No property found.</p>;

  return (
    <div className="property-info-container">
      <div style={{fontSize:"20px", marginBottom:"30px", marginTop:"15px"}}>
        <Link style={{color:"#ff8c00", fontWeight:"bold"}} to="/">Main</Link> &gt; <Link style={{color:"#ff8c00", fontWeight:"bold"}} to="/properties">Properties</Link> &gt; <span style={{fontWeight:"bold"}}>Property Information</span>
      </div>
      <h1>Property Information</h1>

      {/* Top section: Main property image + status */}
      <div className="top-section">
        <div className="property-image">
          <img 
            src={property.property_image} 
            alt={property.name || "Property"} 
          />
          <div className="status-box">{property.status}</div>
        </div>
      </div>

      {/* Details section: Name, description, type, price */}
      <div className="details-section">
        <div className="basic-info">
          <h2>{property.name}</h2>
          <p>{property.description}</p>
        </div>

        <div className="row">
          <div className="col">
            <strong>Property Type:</strong> {property.property_type}
          </div>
          <div className="col">
            <strong>Price:</strong> ${property.price}
          </div>
        </div>

        {/* Extra details row: year, bedrooms, bathrooms, size, available from */}
        <div className="row">
          <div className="col">
            <strong>Year Built:</strong> {property.year_built}
          </div>
          <div className="col">
            <strong>Bedrooms:</strong> {property.bedrooms}
          </div>
          <div className="col">
            <strong>Bathrooms:</strong> {property.bathrooms}
          </div>
          <div className="col">
            <strong>Size:</strong> {property.size} sq ft
          </div>
          <div className="col">
            <strong>Available From:</strong> {property.available_from}
          </div>
        </div>
      </div>

      {/* 360 Image section */}
      <div className="image-360-section">
      <h2>360 image</h2>
        <img 
          src={property.property_360_image} 
          alt="360 Tour" 
        />
      </div>

      {/* Bottom buttons */}
      <div className="buttons-container">
        <Button text="Book Now" onClick={() => alert("Booking...")} />
        <Button text="Go Back" onClick={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default PropertyInfo;
