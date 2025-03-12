import React from "react";
import useProperties from "../hooks/useProperties";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const Properties = () => {
  const {
    properties,
    loading,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    propertyTypeFilter,
    setPropertyTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useProperties();

  const navigate = useNavigate();

  return (
    <div className="properties-container">
      <h1>Our Properties</h1>

      {/* Search & Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-dropdown"
        >
          <option value="asc">Sort by Price: Low to High</option>
          <option value="desc">Sort by Price: High to Low</option>
        </select>

        <select
          value={propertyTypeFilter}
          onChange={(e) => setPropertyTypeFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Property Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
        </select>
      </div>

      {/* Property Cards */}
      {loading ? (
        <p className="loading">Loading properties...</p>
      ) : (
        <div className="property-list">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div key={property.id} className="property-card">
                <img
                  src={property.property_image}
                  alt={property.name}
                  className="property-image"
                />
                <div className="property-info">
                  <h2>{property.name}</h2>
                  <p><strong>Price:</strong> ${property.price}</p>
                  <p><strong>Type:</strong> {property.property_type}</p>
                  <p style={{marginBottom:"20px"}}><strong>Available From:</strong> {property.available_from}</p>
                  <Button text="View Details" onClick={() => navigate(`/property/${property.id}`)} />
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No properties found.</p>
          )}
        </div>
      )}

      {/* Pagination using Reusable Button */}
      {totalPages > 1 && (
        <div className="pagination">
          <Button
            text="Previous"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            text="Next"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default Properties;
