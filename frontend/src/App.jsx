import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Statistics from "./pages/Statistics";
import TrackCasePage from "./pages/TrackCasePage";
import About from "./pages/About";
import Contact from "./pages/Contact"; // Import the Contact component
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/track-case" element={<TrackCasePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />{" "}
            {/* Add Contact route */}
            {/* Add more routes here as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
