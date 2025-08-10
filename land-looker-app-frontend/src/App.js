import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Properties from "./components/Properties";
import Aboutus from "./components/Aboutus";
import PropertyInfo from "./components/PropertyInfo";
import Login from "./components/Login";
import Register from "./components/Register";
import BuyerBookings from "./components/BuyerBookings";
import WorkerMain from "./components/WokerMain";

import "./App.css";

function App() {
  const [isAuthed, setIsAuthed] = useState(
    Boolean(sessionStorage.getItem("authToken"))
  );

  useEffect(() => {
    const checkAuth = () => {
      const hasToken = Boolean(sessionStorage.getItem("authToken"));
      setIsAuthed(hasToken);
    };

    // initial check + 1s polling
    checkAuth();
    const intervalId = setInterval(checkAuth, 1000);

    // keep in sync if changed from another tab
    const onStorage = (e) => {
      if (e.key === "authToken") checkAuth();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <Router>
      {isAuthed && <Menu />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Main />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyInfo />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/my-bookings" element={<BuyerBookings />} />
        <Route path="/worker-home" element={<WorkerMain />} />
      </Routes>
      {isAuthed && <Footer />}
    </Router>
  );
}

export default App;
