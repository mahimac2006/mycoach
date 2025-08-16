import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./GlobalStyles.css";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link 
        to="/dashboard" 
        className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
      >
        📊 Dashboard
      </Link>
      <Link 
        to="/chat" 
        className={`nav-link ${location.pathname === "/chat" ? "active" : ""}`}
      >
        💬 Chat with Coach
      </Link>
      <Link 
        to="/progress" 
        className={`nav-link ${location.pathname === "/progress" ? "active" : ""}`}
      >
        📈 Progress Chart
      </Link>
      <Link 
        to="/training-plan" 
        className={`nav-link ${location.pathname === "/training-plan" ? "active" : ""}`}
      >
        📋 Training Plan
      </Link>
      <Link 
        to="/account" 
        className={`nav-link ${location.pathname === "/account" ? "active" : ""}`}
      >
        ⚙️ Account
      </Link>
    </nav>
  );
}

export default Navigation;