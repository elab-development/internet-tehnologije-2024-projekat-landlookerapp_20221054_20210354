import { useState, useEffect } from "react";
import axios from "axios";

const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 8;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/properties");
      setProperties(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredProperties = properties
    .filter((property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((property) =>
      propertyTypeFilter ? property.property_type === propertyTypeFilter : true
    )
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  return {
    properties: paginatedProperties,
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
  };
};

export default useProperties;
