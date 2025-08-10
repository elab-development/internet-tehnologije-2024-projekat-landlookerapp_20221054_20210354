// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./Button";
import AuthBgSlider from "./AuthBgSlider";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // guard against double submits
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email: form.email,
        password: form.password,
      });

      const data = res?.data ?? {};
      const token = data.token || data.access_token || data?.data?.token;
      const user =
        data.user || data.data?.user || data.data || { email: form.email };

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        sessionStorage.setItem("authToken", token);
      }
      sessionStorage.setItem("user", JSON.stringify(user));

      navigate("/home", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Check your credentials and try again.";
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
          onSubmit={handleLogin}
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: 420,
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
            Welcome back
          </h1>
          <p
            style={{
              textAlign: "center",
              marginBottom: 22,
              color: "var(--dark-gray)",
              opacity: 0.8,
            }}
          >
            Sign in to continue
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
            placeholder="Your password"
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
            {/* If your Button forwards the "type" prop, this will submit the form */}
            <Button
              text={loading ? "Logging in..." : "Login"}
              disabled={loading}
              onClick={handleLogin}
            />
            <Button text="Register" onClick={() => navigate("/register")} />
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
