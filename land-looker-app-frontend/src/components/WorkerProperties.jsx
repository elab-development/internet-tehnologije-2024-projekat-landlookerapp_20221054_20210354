// src/components/WorkerProperties.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "./Button";
import "leaflet/dist/leaflet.css";

// --- API base (direct Laravel, no proxy) ---
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// 5 per page per your spec
const pageSize = 6;

const roleOf = (u) =>
  (u?.user_type || u?.role || u?.type || "").toString().toLowerCase();

const parseUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const emptyForm = {
  name: "",
  property_image: "",
  property_360_image: "",
  description: "",
  price: "",
  size: "",
  property_type: "house",
  bedrooms: 1,
  bathrooms: 1,
  year_built: "",
  location_id: "",
  available_from: "",
  status: "available",
};

// ---------- Create/Edit Modal (scrollable) ----------
const PropertyFormModal = ({ open, onClose, onSubmit, initial, locations }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial || emptyForm);
      setSaving(false);
      setError("");
    }
  }, [open, initial]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        price: form.price === "" ? "" : Number(form.price),
        size: form.size === "" ? "" : Number(form.size),
        bedrooms: Number(form.bedrooms || 1),
        bathrooms: Number(form.bathrooms || 1),
        year_built: form.year_built === "" ? null : Number(form.year_built),
        location_id: Number(form.location_id),
        available_from: form.available_from || null,
      });
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        "Failed to save property.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
          padding: 20,
          marginTop: 24,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>{initial ? "Edit property" : "Create property"}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{ background: "transparent", border: 0, fontSize: 22, cursor: "pointer", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#ffe5e5",
              border: "1px solid #ffcccc",
              color: "#a30000",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={change}
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Price *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={change}
              required
              min="0"
              step="0.01"
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Size (sq ft) *</label>
            <input
              type="number"
              name="size"
              value={form.size}
              onChange={change}
              required
              min="0"
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Property type *</label>
            <select
              name="property_type"
              value={form.property_type}
              onChange={change}
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", background: "#fff" }}
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Bedrooms *</label>
            <input
              type="number"
              name="bedrooms"
              value={form.bedrooms}
              onChange={change}
              min="1"
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Bathrooms *</label>
            <input
              type="number"
              name="bathrooms"
              value={form.bathrooms}
              onChange={change}
              min="1"
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Year built</label>
            <input
              type="number"
              name="year_built"
              value={form.year_built}
              onChange={change}
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Available from</label>
            <input
              type="date"
              name="available_from"
              value={form.available_from}
              onChange={change}
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div style={{ gridColumn: "1 / span 2" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              className="auth-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e6e6e6",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Main image (URL)</label>
            <input
              name="property_image"
              value={form.property_image}
              onChange={change}
              placeholder="https://.../image.jpg"
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>360 image (URL)</label>
            <input
              name="property_360_image"
              value={form.property_360_image}
              onChange={change}
              placeholder="https://.../pano.jpg"
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={change}
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", background: "#fff" }}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          {/* choose location BY NAME (value = id) */}
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Location *</label>
            <select
              name="location_id"
              value={form.location_id}
              onChange={change}
              required
              className="auth-input"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", background: "#fff" }}
            >
              <option value="" disabled>
                Select location…
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              (Biraš po <strong>nazivu</strong>, a šalje se odgovarajući <code>location_id</code>)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
          <Button text="Cancel" onClick={() => onClose?.()} />
          <Button text={saving ? "Saving..." : initial ? "Save changes" : "Create"} disabled={saving} onClick={submit} />
        </div>
      </form>
    </div>
  );
};

// ---------- Leaflet map (with jitter for overlapping coordinates) ----------
const OSMMap = ({ markers }) => {
  const containerRef = useRef(null);
  const ctx = useRef({ L: null, map: null, layer: null });

  useEffect(() => {
    let killed = false;
    const boot = async () => {
      if (!ctx.current.L) {
        try {
          const L = (await import("leaflet")).default;
          ctx.current.L = L;
        } catch {
          return;
        }
      }
      if (killed || !containerRef.current) return;

      const { L } = ctx.current;
      if (!ctx.current.map) {
        ctx.current.map = L.map(containerRef.current, {
          zoomControl: true,
        }).setView([44.787, 20.457], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(ctx.current.map);
        ctx.current.layer = L.layerGroup().addTo(ctx.current.map);
      }

      const pts = [];
      const layer = ctx.current.layer;
      layer.clearLayers();

      markers
        .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))
        .forEach((m) => {
          const mark = ctx.current.L.circleMarker([m.lat, m.lng], {
            radius: 8,
            weight: 2,
            color: "#1a73e8",
            fillColor: "#4285f4",
            fillOpacity: 0.85,
          }).bindPopup(m.title || "Property");
          mark.addTo(layer);
          pts.push([m.lat, m.lng]);
        });

      if (pts.length) ctx.current.map.fitBounds(pts, { padding: [30, 30] });
    };

    boot();
    return () => {
      killed = true;
    };
  }, [markers]);

  useEffect(() => {
    return () => {
      if (ctx.current.map) {
        ctx.current.map.remove();
        ctx.current.map = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 420,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    />
  );
};

const WorkerProperties = () => {
  const [user] = useState(() => parseUser());
  const isWorker = roleOf(user) === "worker";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [locations, setLocations] = useState([]);
  const [locErr, setLocErr] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const tokenHeader = () => {
    const token = sessionStorage.getItem("authToken");
    return {
      Authorization: token ? `Bearer ${token}` : undefined,
      Accept: "application/json",
    };
  };

  // Load locations (must provide id, name, latitude, longitude)
  const loadLocations = async () => {
    setLocErr("");
    try {
      const res = await axios.get(`${API_BASE}/locations`, { headers: tokenHeader() });
      const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
      setLocations(list || []);
    } catch (e) {
      setLocErr("Ne mogu da učitam lokacije.");
    }
  };

  // Load properties list
  const loadProps = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/properties`, { headers: tokenHeader() });
      const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
      setItems(list || []);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.error || e.message || "Failed to load properties.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProps();
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (payload) => {
    await axios.post(`${API_BASE}/properties`, payload, { headers: tokenHeader() });
    await loadProps();
  };

  const onEdit = (p) => {
    setEditing(p);
    setEditOpen(true);
  };

  const onUpdate = async (payload) => {
    await axios.put(`${API_BASE}/properties/${editing.id}`, payload, { headers: tokenHeader() });
    await loadProps();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    await axios.delete(`${API_BASE}/properties/${id}`, { headers: tokenHeader() });
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage]
  );

  // Build markers from properties (use property.location provided by backend).
  // Add slight jitter if multiple properties share identical coords.
  const [markers, setMarkers] = useState([]);
  useEffect(() => {
    const ms = (items || [])
      .map((p) => {
        const lat = Number(p?.location?.latitude);
        const lng = Number(p?.location?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng, title: p.name || `Property #${p.id}` };
      })
      .filter(Boolean);

    // jitter duplicates
    const seen = new Map();
    const jittered = ms.map((m) => {
      const key = `${m.lat.toFixed(6)},${m.lng.toFixed(6)}`;
      const count = (seen.get(key) || 0) + 1;
      seen.set(key, count);
      if (count === 1) return m;
      const dx = (Math.random() - 0.5) * 0.0003; // ~20–30m
      const dy = (Math.random() - 0.5) * 0.0003;
      return { ...m, lat: m.lat + dy, lng: m.lng + dx };
    });

    setMarkers(jittered);
  }, [items]);

  if (!isWorker) {
    return (
      <div className="container" style={{ padding: "24px 16px", maxWidth: 1100, margin: "100px auto" }}>
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #ffe8bf",
            color: "#8a5a00",
            borderRadius: 12,
            padding: 16,
          }}
        >
          Morate biti prijavljeni kao <strong>worker</strong> da biste upravljali nekretninama.
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "24px 16px", maxWidth: 1100, margin: "100px auto" }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: "20px", marginBottom: "10px", marginTop: "10px" }}>
        <Link style={{ color: "#ff8c00", fontWeight: "bold" }} to="/worker-home">
          Main
        </Link>{" "}
        / <span style={{ fontWeight: "bold" }}>Manage Properties</span>
      </div>

      {/* Title + Create */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h1 style={{ margin: 0 }}>Manage Properties</h1>
        <Button text="Create new property" onClick={() => setCreateOpen(true)} />
      </div>

      {/* Locations load error (non-blocking) */}
      {locErr && (
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #ffe8bf",
            color: "#8a5a00",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          {locErr}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="loading-text">Loading properties…</p>
      ) : err ? (
        <p className="error-text">Error: {err}</p>
      ) : !items.length ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 28,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <h2 style={{ marginTop: 0 }}>No properties yet…</h2>
          <p style={{ opacity: 0.8, marginBottom: 18 }}>Dodajte svoju prvu nekretninu.</p>
          <Button text="Create new property" onClick={() => setCreateOpen(true)} />
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {pageItems.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {p.property_image ? (
                  <img
                    src={p.property_image}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #eee",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      borderRadius: 10,
                      border: "1px dashed #ddd",
                      display: "grid",
                      placeItems: "center",
                      color: "#999",
                    }}
                  >
                    No image
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{p.name}</h3>
                  <span style={{ fontWeight: 700 }}>${Number(p.price).toLocaleString()}</span>
                </div>

                <div style={{ opacity: 0.85, fontSize: 14 }}>
                  <div>
                    <strong>Type:</strong> {p.property_type}
                  </div>
                  <div>
                    <strong>Size:</strong> {p.size} sq ft
                  </div>
                  <div>
                    <strong>Status:</strong> {p.status}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                  <Button text="Edit" onClick={() => onEdit(p)} />
                  <Button text="Delete" onClick={() => onDelete(p.id)} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 24 }}>
            <Button
              text="Prev"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  style={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    background: n === currentPage ? "var(--accent, #ff8c00)" : "#fff",
                    color: n === currentPage ? "#fff" : "inherit",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <Button
              text="Next"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            />
          </div>
        </>
      )}

      {/* Map box */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: 18,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Locations of our properties</h2>
        <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 12 }}>
          Markeri po lokacijama (naziv → koordinate).
        </p>
        <OSMMap markers={markers} />
        {!markers.length && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
            Nema dostupnih koordinata. Uverite se da lokacije imaju latitude/longitude.
          </div>
        )}
      </div>

      {/* Modals */}
      <PropertyFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
        locations={locations}
      />
      <PropertyFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={onUpdate}
        initial={editing}
        locations={locations}
      />
    </div>
  );
};

export default WorkerProperties;
