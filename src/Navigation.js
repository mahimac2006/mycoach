import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./GlobalStyles.css";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link 
          to="/dashboard" 
          className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <span>📊</span>
          Dashboard
        </Link>
        <Link 
          to="/chat" 
          className={`nav-link ${location.pathname === "/chat" ? "active" : ""}`}
        >
          <span>💬</span>
          Chat
        </Link>
        <Link 
          to="/progress" 
          className={`nav-link ${location.pathname === "/progress" ? "active" : ""}`}
        >
          <span>📈</span>
          Progress
        </Link>
        <Link 
          to="/training-plan" 
          className={`nav-link ${location.pathname === "/training-plan" ? "active" : ""}`}
        >
          <span>📋</span>
          Plan
        </Link>
        <Link 
          to="/account" 
          className={`nav-link ${location.pathname === "/account" ? "active" : ""}`}
        >
          <span>⚙️</span>
          Account
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;