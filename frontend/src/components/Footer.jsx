import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Anti-Corruption System</h3>
            <p className="text-gray-400 text-sm">
              Fighting corruption through technology and transparency.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to="/report"
                  className="hover:text-white transition-colors"
                >
                  Report Corruption
                </Link>
              </li>
              <li>
                <Link
                  to="/track-case"
                  className="hover:text-white transition-colors"
                >
                  Track Your Case
                </Link>
              </li>
              <li>
                <Link
                  to="/statistics"
                  className="hover:text-white transition-colors"
                >
                  View Statistics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>University of Gondar</li>
              <li>Computer Science Department</li>
              <li>Gondar, Ethiopia</li>
              <li>Email: contact@anticorruption.et</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>
            &copy; 2024 Corruption Reporting System. University of Gondar Final
            Year Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
