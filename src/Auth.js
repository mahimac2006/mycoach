import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./GlobalStyles.css";

function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-header">
          <h1 style={{ margin: 0, fontSize: "2rem" }}>🏃‍♀️ RunCoach AI</h1>
          <p style={{ margin: "10px 0 0 0", fontSize: "1.1rem", opacity: 0.8 }}>
            Your personal AI running coach
          </p>
        </div>

        <div className="auth-tabs">
          <div 
            className={`auth-tab ${showLogin ? 'active' : ''}`}
            onClick={() => setShowLogin(true)}
          >
            Log In
          </div>
          <div 
            className={`auth-tab ${!showLogin ? 'active' : ''}`}
            onClick={() => setShowLogin(false)}
          >
            Sign Up
          </div>
        </div>

        <div>
          {showLogin ? <Login /> : <Signup />}
        </div>

        <div style={{ 
          textAlign: "center", 
          marginTop: "30px", 
          padding: "20px",
          background: "rgba(37, 99, 235, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(37, 99, 235, 0.1)"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--primary-blue)" }}>
            Why Choose RunCoach AI?
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
            <div>🎯 Personalized training plans</div>
            <div>💬 24/7 AI coach support</div>
            <div>📊 Progress tracking & analytics</div>
            <div>🏆 Goal-oriented training</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;



