import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu"; 
import Main from "./components/Main"; 
import Footer from "./components/Footer";
import Properties from "./components/Properties";

import "./App.css";

function App() {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/properties" element={<Properties/>} />
        <Route path="/about" element={<span/>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
