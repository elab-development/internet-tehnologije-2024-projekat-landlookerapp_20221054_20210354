import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src="/assets/logo.png" alt="LandLooker Logo" className="logo" />
        <span className="site-title">LandLooker</span>
      </div>
      <ul className="nav-links">
        <li><NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
        <li><NavLink to="/properties" className={({ isActive }) => isActive ? "active" : ""}>Properties</NavLink></li>
        <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>About Us</NavLink></li>
      </ul>
    </nav>
  );
};

export default Menu;
