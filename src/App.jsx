import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Food";
import Dates from "./pages/Dates";
import Trips from "./pages/Trips";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-b from-[#658C58] to-[#F0E491]">
        <Navbar />
        <div className="pt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dates" element={<Dates />} />
            <Route path="/trips" element={<Trips />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
