import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ddd"
  };

  
  const linkStyle = {
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    color: "#333",
    fontWeight: "bold"
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  return (
    <nav style={navStyle}>
      <Link 
        to="/dashboard" 
        style={location.pathname === "/dashboard" ? activeLinkStyle : linkStyle}
      >
        Dashboard
      </Link>
      <Link 
        to="/chat" 
        style={location.pathname === "/chat" ? activeLinkStyle : linkStyle}
      >
        Chat with Coach
      </Link>
      <Link 
        to="/progress" 
        style={location.pathname === "/progress" ? activeLinkStyle : linkStyle}
      >
        Progress Chart
      </Link>
      <Link 
        to="/training-plan" 
        style={location.pathname === "/training-plan" ? activeLinkStyle : linkStyle}
      >
        Training Plan
      </Link>
      <Link 
        to="/account" 
        style={location.pathname === "/account" ? activeLinkStyle : linkStyle}
      >
        Account
      </Link>
    </nav>
  );
}

export default Navbar;