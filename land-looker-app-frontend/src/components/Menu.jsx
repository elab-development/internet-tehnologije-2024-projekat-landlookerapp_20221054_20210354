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

  // keep in sync if storage changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "authToken") setUser(parseUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || user?.full_name || "";
    if (!name) {
      const email = user?.email || "";
      return email ? email[0].toUpperCase() : "?";
    }
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [user]);

  const role = useMemo(() => {
    return (user?.user_type || user?.role || user?.type || "—").toString();
  }, [user]);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    const token = sessionStorage.getItem("authToken");
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        null,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
    } catch (e) {
      // ignore API errors on logout; still clear client session
    } finally {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="navbar" style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px" }}>
      <div className="logo-container" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/assets/logo.png" alt="LandLooker Logo" className="logo" style={{ height: 36 }} />
        <span className="site-title" style={{ fontWeight: 700 }}>LandLooker</span>
      </div>

      <ul className="nav-links" style={{ display: "flex", gap: 16, marginLeft: 24 }}>
        <li><NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink></li>
        <li><NavLink to="/properties" className={({ isActive }) => (isActive ? "active" : "")}>Properties</NavLink></li>
        <li><NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About Us</NavLink></li>
      </ul>

      {/* Right side user panel */}
      <div
        className="user-menu"
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Avatar with initials */}
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

        {/* Text block */}
        <div className="user-text" style={{ lineHeight: 1.2, textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Currently logged in</div>
          <div style={{ fontWeight: 600 }}>{user?.name || user?.full_name || user?.email || "User"}</div>
          <div style={{ fontSize: 12, opacity: 0.8, textTransform: "capitalize" }}>{role}</div>
        </div>

        {/* Logout button */}
        <div>
          <Button
            text={loggingOut ? "Logging out..." : "Logout"}
            disabled={loggingOut}
            onClick={onLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Menu;
