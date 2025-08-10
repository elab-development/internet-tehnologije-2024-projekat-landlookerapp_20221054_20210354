// src/components/ManageBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "./Button";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Call Laravel directly (no CRA proxy)
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

const STATUS_COLORS = {
  pending: "#ffb020",
  confirmed: "#0f9d58",
  cancelled: "#d93025",
};
const PIE_COLORS = ["#0f9d58", "#ffb020", "#d93025"];

const parseUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const roleOf = (u) =>
  (u?.user_type || u?.role || u?.type || "").toString().toLowerCase();

const ManageBookings = () => {
  const [user] = useState(() => parseUser());
  const isWorker = roleOf(user) === "worker";

  const tokenHeader = () => {
    const token = sessionStorage.getItem("authToken");
    return {
      Authorization: token ? `Bearer ${token}` : undefined,
      Accept: "application/json",
    };
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [stats, setStats] = useState([]); // top_booked_properties

  const loadBookings = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/worker-bookings`, {
        headers: tokenHeader(),
      });
      const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
      setBookings(list || []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Failed to load bookings.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/booking-statistics`, {
        headers: tokenHeader(),
      });
      const items = res?.data?.top_booked_properties || [];
      // Normalize to { name, count }
      setStats(
        items.map((p) => ({
          name: p.name || `#${p.id}`,
          count:
            p.bookings_count ??
            p.bookings?.length ??
            Number(p.bookings_count || 0),
        }))
      );
    } catch {
      setStats([]);
    }
  };

  useEffect(() => {
    if (!isWorker) {
      setLoading(false);
      return;
    }
    loadBookings();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (b, newStatus) => {
    // Optimistic UI
    const prev = bookings;
    setBookings((cur) =>
      cur.map((x) => (x.id === b.id ? { ...x, status: newStatus } : x))
    );
    try {
      await axios.patch(
        `${API_BASE}/worker-bookings/${b.id}/status`,
        { status: newStatus },
        { headers: tokenHeader() }
      );
    } catch (e) {
      // rollback
      setBookings(prev);
      alert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to update status."
      );
    }
  };

  const statusBreakdown = useMemo(() => {
    const acc = { confirmed: 0, pending: 0, cancelled: 0 };
    bookings.forEach((b) => {
      const k = (b.status || "").toLowerCase();
      if (acc[k] !== undefined) acc[k] += 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  if (!isWorker) {
    return (
      <div
        className="container"
        style={{ padding: "24px 16px", maxWidth: 1100, margin: "100px auto" }}
      >
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #ffe8bf",
            color: "#8a5a00",
            borderRadius: 12,
            padding: 16,
          }}
        >
          Morate biti prijavljeni kao <strong>worker</strong> da biste videli
          ovu stranicu.
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "24px 16px", maxWidth: 1100, margin: "100px auto" }}
    >
      {/* Breadcrumbs */}
      <div style={{ fontSize: 20, marginBottom: 10, marginTop: 10 }}>
        <Link style={{ color: "#ff8c00", fontWeight: "bold" }} to="/worker-home">
          Main
        </Link>{" "}
        / <span style={{ fontWeight: "bold" }}>Manage Bookings</span>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Manage Bookings</h1>
        <Button text="Refresh" onClick={() => loadBookings()} />
      </div>

      {/* List */}
      {loading ? (
        <p className="loading-text">Loading bookings…</p>
      ) : err ? (
        <p className="error-text">Error: {err}</p>
      ) : bookings.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 28,
          }}
        >
          You don’t have any bookings yet.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(80px,120px) 1fr minmax(150px,220px) minmax(140px,200px) minmax(160px,220px)",
              gap: 12,
              fontWeight: 700,
              padding: "6px 8px 12px 8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>ID</div>
            <div>Property</div>
            <div>Buyer</div>
            <div>Total / Method</div>
            <div>Status</div>
          </div>

          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(80px,120px) 1fr minmax(150px,220px) minmax(140px,200px) minmax(160px,220px)",
                gap: 12,
                alignItems: "center",
                padding: "10px 8px",
                borderBottom: "1px solid #f2f2f2",
              }}
            >
              <div>#{b.id}</div>

              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600 }}>
                  {b?.property?.name || `Property #${b.property_id}`}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Date: {new Date(b.booking_date).toLocaleDateString()}
                </div>
              </div>

              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600 }}>
                  {b?.buyer?.name || b?.buyer?.email || "—"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {b?.buyer?.email || ""}
                </div>
              </div>

              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700 }}>
                  ${Number(b.total_price).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {b.payment_method?.replace("_", " ")}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: STATUS_COLORS[b.status] || "#777",
                    display: "inline-block",
                  }}
                />
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b, e.target.value)}
                  className="auth-input"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #e6e6e6",
                    background: "#fff",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Booking Statistics</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            minHeight: 320,
          }}
        >
          {/* Top properties (bar) */}
          <div style={{ minHeight: 280 }}>
            <h3 style={{ marginTop: 0, fontSize: 16, opacity: 0.85 }}>
              Top 5 properties by bookings
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats}>
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}>
              (Property names hidden on axis to avoid overlap — hover for
              details)
            </div>
          </div>

          {/* Status breakdown (pie) */}
          <div style={{ minHeight: 280 }}>
            <h3 style={{ marginTop: 0, fontSize: 16, opacity: 0.85 }}>
              Status breakdown
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
