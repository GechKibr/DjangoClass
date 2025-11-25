import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="mr-2">⚖️</span>
              Anti-Corruption System
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link
              to="/"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Home
            </Link>
            <Link
              to="/report"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Report
            </Link>
            <Link
              to="/track-case"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Track Case
            </Link>
            <Link
              to="/statistics"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Statistics
            </Link>
            <Link
              to="/about"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700 rounded-lg mt-2">
              <Link
                to="/"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/report"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Report Corruption
              </Link>
              <Link
                to="/track-case"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Case
              </Link>
              <Link
                to="/statistics"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Statistics
              </Link>
              <Link
                to="/about"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block hover:bg-blue-600 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
