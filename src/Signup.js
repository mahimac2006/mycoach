import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom"; 

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up:", userCred.user);
      // Redirect new users to onboarding instead of dashboard
      navigate("/onboarding"); 
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    backgroundColor: loading ? "#ccc" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer"
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input 
        placeholder="Email" 
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)} 
        style={inputStyle}
        disabled={loading}
      />
      <input 
        placeholder="Password" 
        type="password" 
        value={password}
        onChange={e => setPassword(e.target.value)} 
        style={inputStyle}
        disabled={loading}
      />
      <button onClick={handleSignup} disabled={loading} style={buttonStyle}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </div>
  );
}

export default Signup;
