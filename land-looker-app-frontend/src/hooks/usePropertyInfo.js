// src/hooks/usePropertyInfo.js
import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "/" }); // CRA proxy → http://127.0.0.1:8000

// Add Authorization header if we have a token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn "http://127.0.0.1:8000/images/x.jpg" into "/images/x.jpg"
const toRelative = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url; // already relative
  }
};

const usePropertyInfo = (id) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/properties/${id}`, { signal: controller.signal });
        const data = res?.data?.data ?? null;

        if (data) {
          // normalize image URLs so they’re same-origin via proxy
          if (data.property_image) data.property_image = data.property_image;
          if (data.property_360_image) data.property_360_image = toRelative(data.property_360_image);
        }

        if (alive) setProperty(data);
      } catch (err) {
        if (!alive || controller.signal.aborted) return;
        const msg = err?.response?.data?.message || err.message || "Failed to load property.";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  return { property, loading, error };
};

export default usePropertyInfo;
