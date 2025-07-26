import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom"; 

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCred => {
        console.log("Signed up:", userCred.user);
        navigate("/onboarding"); 
      })
      .catch(err => alert(err.message));
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;
