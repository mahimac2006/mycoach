import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./GlobalStyles.css";

function Auth() {
  const [showLogin, setShowLogin] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowForm(true);
  };

  const handleShowSignup = () => {
    setShowLogin(false);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
  };

  if (!showForm) {
    // Hero Landing Page
    return (
      <div className="auth-container">
        <div className="auth-hero">
          <h1>myCoach</h1>
          
          <div className="auth-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleShowLogin}
            >
              Log In
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={handleShowSignup}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "30px",
          maxWidth: "800px",
          margin: "0 auto" 
        }}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎯</div>
            <h3 style={{ marginBottom: "10px" }}>Personalized Plans</h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              AI-generated training plans tailored to your goals and experience level
            </p>
          </div>
          
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>💬</div>
            <h3 style={{ marginBottom: "10px" }}>24/7 AI Coach</h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Get instant support, motivation, and advice whenever you need it
            </p>
          </div>
          
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📊</div>
            <h3 style={{ marginBottom: "10px" }}>Track Progress</h3>
            <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Monitor your runs, see your improvement, and stay motivated
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form Page
  return (
    <div className="auth-container">
      <div className="auth-form">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "10px",
            background: "linear-gradient(135deg, #ffffff, #60a5fa)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            myCoach
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "20px" }}>
            {showLogin ? "Welcome back! Sign in to continue your training." : "Join thousands of runners achieving their goals."}
          </p>
          
          <button 
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline"
            }}
          >
            ← Back to main page
          </button>
        </div>

        <div>
          {showLogin ? <Login /> : <Signup />}
        </div>

        <div style={{ 
          textAlign: "center", 
          marginTop: "30px",
          padding: "20px 0",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {showLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setShowLogin(!showLogin)}
              style={{
                background: "none",
                border: "none",
                color: "#60a5fa",
                cursor: "pointer",
                fontWeight: "600",
                textDecoration: "underline"
              }}
            >
              {showLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;