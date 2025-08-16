import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./GlobalStyles.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up:", userCred.user);
      navigate("/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <input 
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="form-input"
        disabled={loading}
        required
      />
      
      <input 
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="form-input"
        disabled={loading}
        required
      />
      
      <input 
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        className="form-input"
        disabled={loading}
        required
      />
      
      <button 
        type="submit"
        disabled={loading}
        className="btn btn-success btn-full"
        style={{ marginTop: "10px" }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

export default Signup;
