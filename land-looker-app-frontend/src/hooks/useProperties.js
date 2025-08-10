// src/hooks/useProperties.js
import { useState, useEffect } from "react";
import axios from "axios";

const toRelative = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url; // already relative
  }
};

const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 8;

  useEffect(() => {
    const controller = new AbortController();
    const fetchProperties = async () => {
      try {
        const res = await axios.get("/api/properties", { signal: controller.signal });
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        // normalize any absolute URLs -> relative (works with the proxy)
        const normalized = list.map((p) => ({
          ...p,
          property_image: p.property_image,
          property_360_image: toRelative(p.property_360_image),
        }));
        setProperties(normalized);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
    return () => controller.abort();
  }, []);

  const filteredProperties = properties
    .filter((property) =>
      (property.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((property) =>
      propertyTypeFilter ? property.property_type === propertyTypeFilter : true
    )
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

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
