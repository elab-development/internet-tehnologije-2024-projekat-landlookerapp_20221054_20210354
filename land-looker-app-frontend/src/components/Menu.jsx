// src/components/Menu.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./Button";

const Menu = () => {
  const navigate = useNavigate();

  const parseUser = () => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(parseUser());
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "authToken") setUser(parseUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const role = useMemo(
    () => (user?.user_type || user?.role || user?.type || "").toString().toLowerCase(),
    [user]
  );
  const isWorker = role === "worker";

  const initials = useMemo(() => {
    const name = user?.name || user?.full_name || "";
    if (!name) {
      const email = user?.email || "";
      return email ? email[0].toUpperCase() : "?";
    }
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [user]);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const token = sessionStorage.getItem("authToken");
    try {
      await axios.post("/api/logout", null, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
    } catch (_) {
      // ignore
    } finally {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/", { replace: true });
    }
  };

  // Build nav items per role
  const navItems = isWorker
    ? [
        { to: "/worker-home", label: "Main" },
        { to: "/worker-properties", label: "Manage Properties" },
        { to: "/worker-bookings", label: "Manage Bookings" },
      ]
    : [
        { to: "/home", label: "Home" },
        { to: "/properties", label: "Properties" },
        { to: "/about", label: "About Us" },
        { to: "/my-bookings", label: "My Bookings" },
      ];

  const logoHome = isWorker ? "/worker-home" : "/home";

  return (
    <nav className="navbar" style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px" }}>
      <div
        className="logo-container"
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        onClick={() => navigate(logoHome)}
        title="Go to main"
      >
        <img src="/assets/logo.png" alt="LandLooker Logo" className="logo" style={{ height: 36 }} />
        <span className="site-title" style={{ fontWeight: 700 }}>LandLooker</span>
      </div>

      <ul className="nav-links" style={{ display: "flex", gap: 16, marginLeft: 24 }}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="user-menu" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          className="avatar"
          aria-label="User avatar"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            background: "var(--dark-gray, #2c3e50)",
            color: "#fff",
            userSelect: "none",
          }}
        >
          {initials}
        </div>

        <div className="user-text" style={{ lineHeight: 1.2, textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Currently logged in</div>
          <div style={{ fontWeight: 600 }}>{user?.name || user?.full_name || user?.email || "User"}</div>
          <div style={{ fontSize: 12, opacity: 0.8, textTransform: "capitalize" }}>{role || "guest"}</div>
        </div>

        <div>
          <Button text={loggingOut ? "Logging out..." : "Logout"} disabled={loggingOut} onClick={onLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Menu;
