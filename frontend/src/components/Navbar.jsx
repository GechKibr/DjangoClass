import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/register">Register</Link> | 
      <Link to="/login">Login</Link> | 
      <Link to="/submit-case">Submit Case</Link> | 
      <Link to="/track-case">Track Case</Link>
    </nav>
  );
};

export default Navbar;
