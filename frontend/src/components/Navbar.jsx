import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Anti-Corruption System
            </Link>
          </div>
          <div className="flex space-x-4 items-center">
            <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded">
              Home
            </Link>
            <Link to="/report" className="hover:bg-blue-700 px-3 py-2 rounded">
              Report
            </Link>
            <Link
              to="/track-case"
              className="hover:bg-blue-700 px-3 py-2 rounded"
            >
              Track Case
            </Link>
            <Link
              to="/statistics"
              className="hover:bg-blue-700 px-3 py-2 rounded"
            >
              Statistics
            </Link>
            <Link to="/about" className="hover:bg-blue-700 px-3 py-2 rounded">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
