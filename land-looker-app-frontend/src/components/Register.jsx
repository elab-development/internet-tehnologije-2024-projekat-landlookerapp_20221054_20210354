// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./Button";
import AuthBgSlider from "./AuthBgSlider";

const COUNTRY_CODES = [
  { code: "+381", label: "Serbia (+381)" },
  { code: "+385", label: "Croatia (+385)" },
  { code: "+387", label: "Bosnia & Herzegovina (+387)" },
  { code: "+382", label: "Montenegro (+382)" },
  { code: "+389", label: "North Macedonia (+389)" },
  { code: "+386", label: "Slovenia (+386)" },
  { code: "+355", label: "Albania (+355)" },
  { code: "+30",  label: "Greece (+30)" },
  { code: "+39",  label: "Italy (+39)" },
  { code: "+34",  label: "Spain (+34)" },
  { code: "+33",  label: "France (+33)" },
  { code: "+49",  label: "Germany (+49)" },
  { code: "+44",  label: "United Kingdom (+44)" },
  { code: "+1",   label: "USA/Canada (+1)" },
];

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "buyer",
    phone_country: "+381",
    phone_local: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Basic sanitize for local phone digits
  const onPhoneLocalChange = (e) => {
    const onlyDigits = e.target.value.replace(/[^\d]/g, "");
    setForm((f) => ({ ...f, phone_local: onlyDigits }));
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const phone_number =
        form.phone_local.trim()
          ? `${form.phone_country}${form.phone_local}`
          : null; // keep nullable to match backend

      await axios.post("http://127.0.0.1:8000/api/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password,
        user_type: form.user_type,
        phone_number, // nullable in backend
        address: form.address || null, // nullable in backend
      });

      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        "Registration failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthBgSlider
        images={Array.from({ length: 10 }, (_, i) => `/assets/slider${i + 1}.jpg`)}
        interval={5000}
        overlay="rgba(255,255,255,0.45)"
      />

      <div
        className="auth-container"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "40px 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <form
          onSubmit={submitRegister}
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
            padding: 28,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <img
              src="/assets/logo.png"
              alt="Landlooker logo"
              style={{ height: 56, width: "auto", objectFit: "contain" }}
              loading="eager"
            />
          </div>

          <h1
            className="auth-title"
            style={{
              fontSize: "1.75rem",
              marginBottom: 8,
              color: "var(--dark-gray)",
              textAlign: "center",
            }}
          >
            Create account
          </h1>
          <p
            style={{
              textAlign: "center",
              marginBottom: 22,
              color: "var(--dark-gray)",
              opacity: 0.8,
            }}
          >
            Fill in the details and continue to login
          </p>

          {error ? (
            <div
              className="auth-error"
              style={{
                background: "#ffe5e5",
                color: "#a30000",
                border: "1px solid #ffcccc",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: ".95rem",
              }}
            >
              {error}
            </div>
          ) : null}

          {/* Name */}
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={onChange}
            placeholder="Jane Doe"
            className="auth-input"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              outline: "none",
              marginBottom: 14,
            }}
          />

          {/* Email */}
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="auth-input"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              outline: "none",
              marginBottom: 14,
            }}
          />

          {/* Password */}
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="Create a password"
            className="auth-input"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              outline: "none",
              marginBottom: 14,
            }}
          />

          {/* User type */}
          <label
            htmlFor="user_type"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            User type
          </label>
          <select
            id="user_type"
            name="user_type"
            value={form.user_type}
            onChange={onChange}
            required
            className="auth-input"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              outline: "none",
              marginBottom: 14,
              background: "#fff",
            }}
          >
            <option value="buyer">Buyer</option>
            <option value="worker">Worker</option>
          </select>

          {/* Phone (country + local) */}
          <label
            htmlFor="phone_local"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            Phone number
          </label>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <select
              id="phone_country"
              name="phone_country"
              value={form.phone_country}
              onChange={onChange}
              className="auth-input"
              style={{
                flex: "0 0 180px",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e6e6e6",
                outline: "none",
                background: "#fff",
              }}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <input
              id="phone_local"
              name="phone_local"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.phone_local}
              onChange={onPhoneLocalChange}
              placeholder="e.g. 641234567"
              className="auth-input"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e6e6e6",
                outline: "none",
              }}
            />
          </div>

          {/* Address */}
          <label
            htmlFor="address"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--dark-gray)",
              fontWeight: 500,
            }}
          >
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={onChange}
            placeholder="Street, number, city"
            className="auth-input"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              outline: "none",
              marginBottom: 20,
            }}
          />

          <div
            className="auth-actions"
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Button text="Login" onClick={() => navigate("/")} />
            <Button
              text={loading ? "Registering..." : "Register"}
              disabled={loading}
              onClick={submitRegister}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;
