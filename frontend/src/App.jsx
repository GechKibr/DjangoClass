import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages

import Home from "./pages/Home";
import Report from "./pages/Report";
import TrackCasePage from "./pages/TrackCasePage";
import Statistics from "./pages/Statistics";
const App = () => {
  return (
    <Router>
      {/* Global Layout Wrapper */}
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Report Page */}
          <Route path="/report" element={<Report />} />

          
          <Route path="/statistics" element={<Statistics />}  
          {/* Extra routes if you plan later */}
          {/* { <Route path="/track-case" element={<TrackCase />} /> } */}
            {/* {trackcase page} */}
          <Route path="/track-case" element={<TrackCasePage />} />
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
