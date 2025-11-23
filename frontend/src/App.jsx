import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add other routes later */}
          {/* <Route path="/report" element={<div>Report Page - Coming Soon</div>} /> */}
          <Route path="/track-case" element={<div>Track Case Page - Coming Soon</div>} />
          <Route path="/statistics" element={<div>Statistics Page - Coming Soon</div>} />
          <Route path="/report" element={<Report />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

