import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Statistics from "./pages/Statistics";
import TrackCasePage from "./pages/TrackCasePage";
<<<<<<< HEAD
import About from "./pages/About";
import Footer from "./components/Footer";
=======
// import About from "./pages/About";
// import Footer from "./components/Footer";
>>>>>>> 694240e (statistics page is add)

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
<<<<<<< HEAD
            <Route path="/about" element={<About />} />
            {/* Add more routes here as needed */}
          </Routes>
        </main>
        <Footer />
=======
            {/* <Route path="/about" element={<About />} /> */}
            {/* Add more routes here as needed */}
          </Routes>
        </main>
        {/* <Footer /> */}
>>>>>>> 694240e (statistics page is add)
      </div>
    </Router>
  );
}

export default App;
