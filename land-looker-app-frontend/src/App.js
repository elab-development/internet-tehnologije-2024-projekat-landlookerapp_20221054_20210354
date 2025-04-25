import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu"; 
import Main from "./components/Main"; 
import Footer from "./components/Footer";
import Properties from "./components/Properties";
import Aboutus from "./components/Aboutus";
import PropertyInfo from "./components/PropertyInfo";

import "./App.css";

function App() {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/properties" element={<Properties/>} />
        <Route path="/property/:id" element={<PropertyInfo />} />
        <Route path="/about" element={<Aboutus/>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
