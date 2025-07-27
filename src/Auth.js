// src/Auth.js
import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h2>{showLogin ? "Login" : "Signup"}</h2>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowLogin(true)}>Log In</button>
        <button onClick={() => setShowLogin(false)}>Sign Up</button>
      </div>
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        {showLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
}

export default Auth;



