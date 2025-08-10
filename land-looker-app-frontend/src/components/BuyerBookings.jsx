// src/components/BuyerBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";

const getUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const getUserType = (u) => (u?.user_type || u?.role || u?.type || "").toString().toLowerCase();

const STATUS_COLORS = {
  pending: "#ffb020",
  confirmed: "#0f9d58",
  cancelled: "#d93025",
};

const PAYMENT_LABELS = {
  credit_card: "Credit card",
  bank_transfer: "Bank transfer",
  paypal: "PayPal",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
};

const EditBookingModal = ({ open, booking, onClose, onSaved }) => {
  const [bookingDate, setBookingDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && booking) {
      setBookingDate(booking.booking_date?.slice(0, 10) || "");
      setTotalPrice(booking.total_price ?? 0);
      setPaymentMethod(booking.payment_method || "credit_card");
      setSaving(false);
      setError("");
    }
  }, [open, booking]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!booking?.id || saving) return;
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.put(
        `/api/bookings/${booking.id}`,
        {
          booking_date: bookingDate,
          total_price: Number(totalPrice) || 0,
          payment_method: paymentMethod,
        },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        "Failed to update booking.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Edit booking #{booking?.id}</h2>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                background: STATUS_COLORS[booking?.status] || "#777",
                textTransform: "capitalize",
              }}
              title="Status is read-only"
            >
              {booking?.status}
            </span>
          </div>
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

        <label htmlFor="booking_date" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Booking date
        </label>
        <input
          id="booking_date"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          required
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", marginBottom: 12 }}
        />

        <label htmlFor="total_price" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Total price (USD)
        </label>
        <input
          id="total_price"
          type="number"
          step="0.01"
          min="0"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", marginBottom: 12 }}
        />

        <label htmlFor="payment_method" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Payment method
        </label>
        <select
          id="payment_method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", marginBottom: 20, background: "#fff" }}
        >
          <option value="credit_card">Credit card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="paypal">PayPal</option>
        </select>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button text="Cancel" onClick={() => onClose?.()} />
          <Button text={saving ? "Saving..." : "Save changes"} disabled={saving} onClick={submit} />
        </div>
      </form>
    </div>
  );
};

const BuyerBookings = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const isBuyer = getUserType(user) === "buyer";

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await axios.get("/api/bookings", {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
      setBookings(list || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Failed to load bookings.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isBuyer) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.response?.data?.error || "Failed to delete.");
    }
  };

  const onEdit = (booking) => {
    setEditing(booking);
    setEditOpen(true);
  };

  const exportCsv = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await axios.get(`/api/bookings/export/csv`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-bookings-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.response?.data?.message || e?.response?.data?.error || e.message || "Export failed.");
    }
  };

  const renderWorker = (b) => {
    const name = b?.worker?.name || b?.worker_name || null;
    const email = b?.worker?.email || b?.worker_email || null;
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
    return `Worker #${b?.worker_id ?? "—"}`;
  };

  const content = useMemo(() => {
    if (!isBuyer) {
      return (
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #ffe8bf",
            color: "#8a5a00",
            borderRadius: 12,
            padding: 16,
          }}
        >
          You must be logged in as a <strong>buyer</strong> to view your bookings.
        </div>
      );
    }

    if (loading) return <p className="loading-text">Loading your bookings...</p>;
    if (err) return <p className="error-text">Error: {err}</p>;

    if (!bookings.length) {
      return (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0 }}>No bookings yet…</h2>
          <p style={{ opacity: 0.8, marginBottom: 18 }}>
            Check our latest offers and find your perfect property.
          </p>
          <Button text="Browse properties" onClick={() => navigate("/properties")} />
        </div>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>Booking #{b.id}</h3>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  background: STATUS_COLORS[b.status] || "#777",
                  textTransform: "capitalize",
                }}
              >
                {b.status}
              </span>
            </div>

            <div style={{ opacity: 0.8, fontSize: 14 }}>
              <div><strong>Property ID:</strong> {b.property_id}</div>
              <div><strong>Date:</strong> {fmtDate(b.booking_date)}</div>
              <div><strong>Total:</strong> ${Number(b.total_price).toFixed(2)}</div>
              <div><strong>Payment:</strong> {PAYMENT_LABELS[b.payment_method] || b.payment_method}</div>
              <div><strong>Worker:</strong> {renderWorker(b)}</div>
            </div>

            <div style={{ marginTop: 6, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button text="Edit" onClick={() => onEdit(b)} />
              <Button text="Delete" onClick={() => onDelete(b.id)} />
            </div>
          </div>
        ))}
      </div>
    );
  }, [isBuyer, loading, err, bookings, navigate]);

  return (
    <div className="container" style={{ padding: "24px 16px", maxWidth: 1100, margin: "100px auto" }}>
      <div style={{ fontSize: "20px", marginBottom: "10px", marginTop: "10px" }}>
        <Link style={{ color: "#ff8c00", fontWeight: "bold" }} to="/home">Main</Link> /{" "}
        <span style={{ fontWeight: "bold" }}>My Bookings</span>
      </div>

      <h1 style={{ textAlign: "center", fontSize: "2.2rem", margin: "8px 0 24px 0" }}>
        My Bookings
      </h1>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 12 }}>
        <Button text="Export CSV" onClick={exportCsv} />
        <Button text="Browse properties" onClick={() => navigate("/properties")} />
      </div>

      {content}

      <EditBookingModal
        open={editOpen}
        booking={editing}
        onClose={() => setEditOpen(false)}
        onSaved={load}
      />
    </div>
  );
};

export default BuyerBookings;
