import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./GlobalStyles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCred.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="form-input"
        disabled={loading}
        required
      />
      
      <button 
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-full"
        style={{ marginTop: "20px" }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            Logging in...
          </div>
        ) : (
          "Log In"
        )}
      </button>
    </form>
  );
}

export default Login;

