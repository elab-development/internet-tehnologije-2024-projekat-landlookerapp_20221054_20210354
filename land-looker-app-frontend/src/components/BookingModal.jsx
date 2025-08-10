// src/components/BookingModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "./Button";

const fmtDate = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const getUserFromSession = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getUserType = (u) =>
  (u?.user_type || u?.role || u?.type || "").toString().toLowerCase();

const BookingModal = ({ open, onClose, property }) => {
  const [bookingDate, setBookingDate] = useState(fmtDate());
  const [status, setStatus] = useState("pending");
  const [totalPrice, setTotalPrice] = useState(property?.price ?? 0);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [user, setUser] = useState(() => getUserFromSession());
  const userType = getUserType(user);
  const canBook = userType === "buyer";

  // refresh form and user every time modal opens
  useEffect(() => {
    if (open) {
      setUser(getUserFromSession());
      setBookingDate(fmtDate());
      setStatus("pending");
      setTotalPrice(property?.price ?? 0);
      setPaymentMethod("credit_card");
      setSubmitting(false);
      setError("");
      setOkMsg("");
    }
  }, [open, property]);

  // keep in sync with other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "authToken") {
        setUser(getUserFromSession());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!canBook) {
      setError("Only buyers can create bookings.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setOkMsg("");

    try {
      const token = sessionStorage.getItem("authToken");
      const payload = {
        property_id: property.id,
        booking_date: bookingDate,
        status,
        total_price: Number(totalPrice) || 0,
        payment_method: paymentMethod,
      };

      const res = await axios.post("/api/bookings", payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      setOkMsg("Booking created successfully.");
      setTimeout(() => onClose?.(res?.data), 600);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        "Failed to create booking.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <form
        onSubmit={submit}
        className="booking-card"
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0px 12px 28px rgba(0,0,0,0.15)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>New Booking</h2>
            <div style={{ opacity: 0.8, fontSize: 14 }}>
              {property?.name ? `Property: ${property.name}` : "Select options below"}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onClose?.()}
            style={{ background: "transparent", border: 0, fontSize: 22, lineHeight: 1, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {!canBook && (
          <div
            style={{
              background: "#fff7e6",
              border: "1px solid #ffe8bf",
              color: "#8a5a00",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            Only buyers can create bookings. Please log in as a buyer.
          </div>
        )}

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

        {okMsg && (
          <div
            style={{
              background: "#e6ffed",
              border: "1px solid #c8f7d1",
              color: "#0b6b2e",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {okMsg}
          </div>
        )}

        <label htmlFor="booking_date" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Booking date
        </label>
        <input
          id="booking_date"
          type="date"
          required
          value={bookingDate}
          min={fmtDate()}
          onChange={(e) => setBookingDate(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", marginBottom: 12 }}
        />

        <label htmlFor="status" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", marginBottom: 12, background: "#fff" }}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label htmlFor="total_price" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Total price (USD)
        </label>
        <input
          id="total_price"
          type="number"
          step="0.01"
          min="0"
          required
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", marginBottom: 12 }}
        />

        <label htmlFor="payment_method" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          Payment method
        </label>
        <select
          id="payment_method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="auth-input"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e6e6e6", outline: "none", marginBottom: 20, background: "#fff" }}
        >
          <option value="credit_card">Credit card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="paypal">PayPal</option>
        </select>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button text="Cancel" onClick={() => onClose?.()} />
          <Button text={submitting ? "Saving..." : "Save booking"} disabled={submitting || !canBook} onClick={submit} />
        </div>
      </form>
    </div>
  );
};

export default BookingModal;
